import { Router } from "express";
import { v4 as uuid } from "uuid";
import { z } from "zod";
import { db } from "../services/db";
import { LoyaltyReward, LoyaltyTier, User } from "../types";

export const loyaltyRouter = Router();

// Loyalty tier thresholds
const TIER_THRESHOLDS = {
  bronze: 0,
  silver: 51,
  gold: 201,
  platinum: 501,
};

const TIER_BENEFITS = {
  bronze: { cashbackPercent: 2, prioritySupport: false, freeCancellations: 0 },
  silver: { cashbackPercent: 5, prioritySupport: true, freeCancellations: 2 },
  gold: { cashbackPercent: 8, prioritySupport: true, freeCancellations: 5 },
  platinum: { cashbackPercent: 12, prioritySupport: true, freeCancellations: Infinity },
};

// Calculate loyalty tier based on total rides
function calculateTier(totalRides: number): LoyaltyTier {
  if (totalRides >= TIER_THRESHOLDS.platinum) return "platinum";
  if (totalRides >= TIER_THRESHOLDS.gold) return "gold";
  if (totalRides >= TIER_THRESHOLDS.silver) return "silver";
  return "bronze";
}

// Get user's loyalty status
loyaltyRouter.get("/status/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const loyaltyStatus = await db.getLoyaltyStatus(userId);
    if (!loyaltyStatus) {
      return res.status(404).json({ message: "User not found" });
    }

    const totalRides = loyaltyStatus.total_rides || 0;
    const tier = calculateTier(totalRides);
    const benefits = TIER_BENEFITS[tier];
    const points = loyaltyStatus.loyalty_points || 0;

    // Calculate next tier progress
    let nextTier: LoyaltyTier | null = null;
    let ridesToNextTier = 0;
    
    if (tier === "bronze") {
      nextTier = "silver";
      ridesToNextTier = TIER_THRESHOLDS.silver - totalRides;
    } else if (tier === "silver") {
      nextTier = "gold";
      ridesToNextTier = TIER_THRESHOLDS.gold - totalRides;
    } else if (tier === "gold") {
      nextTier = "platinum";
      ridesToNextTier = TIER_THRESHOLDS.platinum - totalRides;
    }

    return res.json({
      tier,
      totalRides,
      points,
      benefits,
      nextTier,
      ridesToNextTier,
      cashbackEarned: points * 0.01, // 1 point = ₦0.01
    });
  } catch (error) {
    console.error("Loyalty status error:", error);
    return res.status(500).json({ message: "Failed to fetch loyalty status" });
  }
});

// Award loyalty points after a ride
loyaltyRouter.post("/award", async (req, res) => {
  const { userId, rideId, fareAmount } = req.body;

  if (!userId || !fareAmount) {
    return res.status(400).json({ message: "userId and fareAmount are required" });
  }

  try {
    const loyaltyStatus = await db.getLoyaltyStatus(userId);
    if (!loyaltyStatus) {
      return res.status(404).json({ message: "User not found" });
    }

    const totalRides = (loyaltyStatus.total_rides || 0) + 1;
    const tier = calculateTier(totalRides);
    const cashbackPercent = TIER_BENEFITS[tier].cashbackPercent;
    
    // Calculate points (1 point per ₦1 spent + cashback)
    const basePoints = Math.floor(fareAmount);
    const bonusPoints = Math.floor(fareAmount * (cashbackPercent / 100));
    const totalPoints = basePoints + bonusPoints;

    // Update user loyalty tier and points
    const newTotalPoints = (loyaltyStatus.loyalty_points || 0) + totalPoints;
    await db.updateLoyaltyTier(userId, tier, newTotalPoints);

    // Create loyalty reward record
    await db.createLoyaltyReward({
      userId,
      points: totalPoints,
      tier,
      cashbackPercent,
    });

    return res.json({
      message: "Loyalty points awarded",
      pointsEarned: totalPoints,
      totalPoints: newTotalPoints,
      tier,
      cashbackPercent,
    });
  } catch (error) {
    console.error("Award points error:", error);
    return res.status(500).json({ message: "Failed to award loyalty points" });
  }
});

// Redeem points for discount
loyaltyRouter.post("/redeem", async (req, res) => {
  const { userId, points } = req.body;

  if (!userId || !points || points <= 0) {
    return res.status(400).json({ message: "Invalid redemption request" });
  }

  try {
    const loyaltyStatus = await db.getLoyaltyStatus(userId);
    if (!loyaltyStatus) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentPoints = loyaltyStatus.loyalty_points || 0;
    if (currentPoints < points) {
      return res.status(400).json({ 
        message: "Insufficient points",
        available: currentPoints,
        requested: points,
      });
    }

    // Minimum redemption: 100 points
    if (points < 100) {
      return res.status(400).json({ message: "Minimum redemption is 100 points" });
    }

    // Deduct points and update tier
    const newPoints = currentPoints - points;
    await db.updateLoyaltyTier(userId, loyaltyStatus.loyalty_tier, newPoints);
    
    // Add to wallet balance (100 points = ₦100)
    await db.createWalletTransaction({
      userId,
      type: "credit",
      amount: points,
      description: `Redeemed ${points} loyalty points`,
      referenceType: "loyalty",
    });

    const newBalance = await db.getWalletBalance(userId);

    return res.json({
      message: "Points redeemed successfully",
      pointsRedeemed: points,
      walletCredited: points,
      remainingPoints: newPoints,
      walletBalance: newBalance,
    });
  } catch (error) {
    console.error("Redeem error:", error);
    return res.status(500).json({ message: "Failed to redeem points" });
  }
});

// Get loyalty rewards history
loyaltyRouter.get("/history/:userId", async (req, res) => {
  const { userId } = req.params;
  const limit = parseInt(req.query.limit as string) || 50;

  try {
    const rewards = await db.getLoyaltyHistory(userId, limit);
    return res.json({ rewards });
  } catch (error) {
    console.error("History error:", error);
    return res.status(500).json({ message: "Failed to fetch rewards history" });
  }
});

// Get leaderboard (top users by loyalty tier/points)
loyaltyRouter.get("/leaderboard", async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 100;

  try {
    const leaderboardData = await db.getLoyaltyLeaderboard(limit);
    const leaderboard = leaderboardData.map(user => ({
      id: user.id,
      name: user.name,
      tier: user.loyalty_tier || "bronze",
      points: user.loyalty_points || 0,
      totalRides: user.total_rides || 0,
    }));

    return res.json({ leaderboard });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
});
