import { Router } from "express";
import { v4 as uuid } from "uuid";
import { z } from "zod";
import { db } from "../services/db";
import { Referral } from "../types";

export const referralsRouter = Router();

// Generate random referral code
function generateReferralCode(name: string): string {
  const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4);
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${cleanName}${random}`;
}

// Referral rewards
const REWARDS = {
  driver_referral: {
    referrer: 10000, // ₦10,000 when referred driver completes 50 trips
    referee: 5000, // ₦5,000 welcome bonus after 50 trips
    requiredTrips: 50,
  },
  rider_referral: {
    referrer: 500, // ₦500 when referred rider completes 5 trips
    referee: 200, // ₦200 welcome bonus after 1st trip
    requiredTrips: 5,
  },
};

// Get or create user's referral code
referralsRouter.get("/code/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = db.users.get(userId) || db.drivers.get(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate code if doesn't exist
    if (!user.referralCode) {
      user.referralCode = generateReferralCode(user.name);
      if (db.users.has(userId)) {
        await db.users.set(userId, user);
      } else {
        await db.drivers.set(userId, user);
      }
    }

    return res.json({
      referralCode: user.referralCode,
      shareLink: `${process.env.APP_URL || 'http://localhost:3000'}/signup?ref=${user.referralCode}`,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to get referral code" });
  }
});

// Apply referral code during signup
referralsRouter.post("/apply", async (req, res) => {
  const { referralCode, newUserId, userType } = req.body;

  if (!referralCode || !newUserId || !userType) {
    return res.status(400).json({ message: "referralCode, newUserId, and userType are required" });
  }

  if (!["driver", "rider"].includes(userType)) {
    return res.status(400).json({ message: "userType must be 'driver' or 'rider'" });
  }

  try {
    // Find user with this referral code
    const allUsers = [
      ...Array.from(db.users.values()),
      ...Array.from(db.drivers.values()),
    ];
    
    const referrer = allUsers.find(u => u.referralCode === referralCode.toUpperCase());
    if (!referrer) {
      return res.status(404).json({ message: "Invalid referral code" });
    }

    // Check if new user already used a referral
    if (!db.referrals) {
      db.referrals = new Map();
    }

    const existingReferral = Array.from(db.referrals.values()).find(
      r => r.refereeId === newUserId
    );
    
    if (existingReferral) {
      return res.status(400).json({ message: "User has already used a referral code" });
    }

    // Create referral record
    const referral: Referral = {
      id: uuid(),
      referrerId: referrer.id,
      refereeId: newUserId,
      type: userType as "driver" | "rider",
      reward: REWARDS[`${userType}_referral` as keyof typeof REWARDS].referrer,
      status: "pending",
      createdAt: new Date(),
    };

    db.referrals.set(referral.id, referral);

    // Give welcome bonus to new user
    const welcomeBonus = REWARDS[`${userType}_referral` as keyof typeof REWARDS].referee;
    const newUser = userType === "rider" ? db.users.get(newUserId) : db.drivers.get(newUserId);
    
    if (newUser) {
      newUser.walletBalance = (newUser.walletBalance || 0) + welcomeBonus;
      if (userType === "rider") {
        await db.users.set(newUserId, newUser);
      } else {
        await db.drivers.set(newUserId, newUser);
      }
    }

    return res.json({
      message: "Referral applied successfully",
      referral,
      welcomeBonus,
      referrerWillEarn: referral.reward,
      requiredTrips: REWARDS[`${userType}_referral` as keyof typeof REWARDS].requiredTrips,
    });
  } catch (error) {
    console.error("Apply referral error:", error);
    return res.status(500).json({ message: "Failed to apply referral" });
  }
});

// Check and complete referral (called after user completes required trips)
referralsRouter.post("/check-completion", async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "userId is required" });
  }

  try {
    if (!db.referrals) {
      return res.json({ completed: [] });
    }

    const user = db.users.get(userId) || db.drivers.get(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find pending referrals where this user is the referee
    const userReferrals = Array.from(db.referrals.values()).filter(
      r => r.refereeId === userId && r.status === "pending"
    );

    const completedReferrals = [];
    const totalRides = user.totalRides || 0;

    for (const referral of userReferrals) {
      const requiredTrips = REWARDS[`${referral.type}_referral` as keyof typeof REWARDS].requiredTrips;
      
      if (totalRides >= requiredTrips) {
        // Complete the referral
        referral.status = "completed";
        db.referrals.set(referral.id, referral);

        // Award reward to referrer
        const referrer = db.users.get(referral.referrerId) || db.drivers.get(referral.referrerId);
        if (referrer) {
          referrer.walletBalance = (referrer.walletBalance || 0) + referral.reward;
          
          if (db.users.has(referral.referrerId)) {
            await db.users.set(referral.referrerId, referrer);
          } else {
            await db.drivers.set(referral.referrerId, referrer);
          }

          completedReferrals.push({
            referralId: referral.id,
            referrerId: referral.referrerId,
            reward: referral.reward,
          });
        }
      }
    }

    return res.json({
      message: completedReferrals.length > 0 ? "Referrals completed" : "No referrals ready for completion",
      completed: completedReferrals,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to check referral completion" });
  }
});

// Get user's referral stats
referralsRouter.get("/stats/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    if (!db.referrals) {
      return res.json({
        totalReferrals: 0,
        completedReferrals: 0,
        pendingReferrals: 0,
        totalEarned: 0,
        referrals: [],
      });
    }

    const allReferrals = Array.from(db.referrals.values());
    const userReferrals = allReferrals.filter(r => r.referrerId === userId);

    const completed = userReferrals.filter(r => r.status === "completed");
    const pending = userReferrals.filter(r => r.status === "pending");
    const totalEarned = completed.reduce((sum, r) => sum + r.reward, 0);

    // Get referee details
    const referralsWithDetails = await Promise.all(
      userReferrals.map(async (ref) => {
        const referee = db.users.get(ref.refereeId) || db.drivers.get(ref.refereeId);
        return {
          ...ref,
          refereeName: referee?.name || "Unknown",
          refereeRides: referee?.totalRides || 0,
        };
      })
    );

    return res.json({
      totalReferrals: userReferrals.length,
      completedReferrals: completed.length,
      pendingReferrals: pending.length,
      totalEarned,
      referrals: referralsWithDetails.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch referral stats" });
  }
});

// Get referral leaderboard
referralsRouter.get("/leaderboard", async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 100;

  try {
    if (!db.referrals) {
      return res.json({ leaderboard: [] });
    }

    // Count completed referrals per user
    const allReferrals = Array.from(db.referrals.values());
    const referralCounts = new Map<string, { count: number; earned: number; name: string }>();

    for (const referral of allReferrals) {
      if (referral.status === "completed") {
        const current = referralCounts.get(referral.referrerId) || { count: 0, earned: 0, name: "" };
        const referrer = db.users.get(referral.referrerId) || db.drivers.get(referral.referrerId);
        
        referralCounts.set(referral.referrerId, {
          count: current.count + 1,
          earned: current.earned + referral.reward,
          name: referrer?.name || "Unknown",
        });
      }
    }

    const leaderboard = Array.from(referralCounts.entries())
      .map(([userId, data]) => ({
        userId,
        name: data.name,
        referralsCompleted: data.count,
        totalEarned: data.earned,
      }))
      .sort((a, b) => b.referralsCompleted - a.referralsCompleted)
      .slice(0, limit);

    return res.json({ leaderboard });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
});
