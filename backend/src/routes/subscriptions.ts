import { Router } from "express";
import { v4 as uuid } from "uuid";
import { z } from "zod";
import { db } from "../services/db";
import { Subscription, SubscriptionPlan } from "../types";

export const subscriptionsRouter = Router();

// Subscription plan details
const SUBSCRIPTION_PLANS = {
  commuter: {
    price: 15000, // ₦15,000/month
    ridesIncluded: 60,
    deliveriesIncluded: 0,
    description: "Perfect for daily work commute",
    features: ["60 rides per month", "Economy vehicles", "Standard support"],
  },
  family: {
    price: 35000, // ₦35,000/month
    ridesIncluded: 150,
    deliveriesIncluded: 10,
    description: "Shared account for the whole family",
    features: ["150 rides per month", "10 deliveries", "All vehicle types", "Priority support"],
  },
  business: {
    price: 90000, // ₦90,000/month
    ridesIncluded: Infinity,
    deliveriesIncluded: 50,
    description: "Unlimited rides for business professionals",
    features: ["Unlimited rides", "50 deliveries", "Premium vehicles", "24/7 priority support", "Expense reports"],
  },
  delivery_plus: {
    price: 8000, // ₦8,000/month
    ridesIncluded: 0,
    deliveriesIncluded: 50,
    description: "For frequent package senders",
    features: ["50 deliveries per month", "10% discount on extra", "Insurance included"],
  },
};

const subscribeSchema = z.object({
  userId: z.string().uuid(),
  plan: z.enum(["commuter", "family", "business", "delivery_plus"] as const),
  autoRenew: z.boolean().optional().default(true),
  paymentMethod: z.enum(["card", "wallet", "bank_transfer"] as const),
});

// Get all available subscription plans
subscriptionsRouter.get("/plans", async (req, res) => {
  try {
    const plans = Object.entries(SUBSCRIPTION_PLANS).map(([key, value]) => ({
      plan: key,
      ...value,
      monthlySavings: calculateSavings(key as SubscriptionPlan),
    }));

    return res.json({ plans });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch subscription plans" });
  }
});

// Calculate estimated savings for a plan
function calculateSavings(plan: SubscriptionPlan): number {
  if (!plan) return 0;
  
  const planDetails = SUBSCRIPTION_PLANS[plan];
  const avgFarePerRide = 500; // Average ₦500 per ride
  const avgFarePerDelivery = 800; // Average ₦800 per delivery
  
  const ridesValue = planDetails.ridesIncluded === Infinity 
    ? 200 * avgFarePerRide // Assume 200 rides for unlimited
    : planDetails.ridesIncluded * avgFarePerRide;
  
  const deliveriesValue = planDetails.deliveriesIncluded * avgFarePerDelivery;
  
  const totalValue = ridesValue + deliveriesValue;
  const savings = totalValue - planDetails.price;
  
  return Math.max(savings, 0);
}

// Subscribe to a plan
subscriptionsRouter.post("/subscribe", async (req, res) => {
  const parsed = subscribeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });

  try {
    const { userId, plan, autoRenew, paymentMethod } = parsed.data;
    
    const user = db.users.get(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user already has an active subscription
    if (user.subscriptionPlan && user.subscriptionExpiresAt && user.subscriptionExpiresAt > new Date()) {
      return res.status(400).json({ 
        message: "Already have an active subscription",
        currentPlan: user.subscriptionPlan,
        expiresAt: user.subscriptionExpiresAt,
      });
    }

    const planDetails = SUBSCRIPTION_PLANS[plan];
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // TODO: Process payment based on paymentMethod
    // For now, assume payment is successful

    // Create subscription
    const subscription: Subscription = {
      id: uuid(),
      userId,
      plan,
      ridesRemaining: planDetails.ridesIncluded === Infinity ? undefined : planDetails.ridesIncluded,
      deliveriesRemaining: planDetails.deliveriesIncluded,
      startsAt: now,
      expiresAt,
      autoRenew,
      price: planDetails.price,
    };

    if (!db.subscriptions) {
      db.subscriptions = new Map();
    }
    db.subscriptions.set(subscription.id, subscription);

    // Update user
    user.subscriptionPlan = plan;
    user.subscriptionExpiresAt = expiresAt;
    await db.users.set(userId, user);

    return res.status(201).json({
      message: "Successfully subscribed",
      subscription,
      benefits: planDetails.features,
      savings: calculateSavings(plan),
    });
  } catch (error) {
    console.error("Subscription error:", error);
    return res.status(500).json({ message: "Failed to create subscription" });
  }
});

// Get user's active subscription
subscriptionsRouter.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = db.users.get(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.subscriptionPlan) {
      return res.json({ subscription: null, message: "No active subscription" });
    }

    // Find subscription details
    const subscriptions = db.subscriptions ? Array.from(db.subscriptions.values()) : [];
    const activeSubscription = subscriptions.find(
      sub => sub.userId === userId && sub.expiresAt > new Date()
    );

    if (!activeSubscription) {
      return res.json({ subscription: null, message: "No active subscription" });
    }

    const planDetails = SUBSCRIPTION_PLANS[activeSubscription.plan];
    const daysRemaining = Math.ceil(
      (activeSubscription.expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    return res.json({
      subscription: activeSubscription,
      planDetails,
      daysRemaining,
      willAutoRenew: activeSubscription.autoRenew,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch subscription" });
  }
});

// Use subscription ride/delivery
subscriptionsRouter.post("/use/:subscriptionId", async (req, res) => {
  const { subscriptionId } = req.params;
  const { type } = req.body; // "ride" or "delivery"

  try {
    if (!db.subscriptions) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    const subscription = db.subscriptions.get(subscriptionId);
    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    // Check if subscription is active
    if (subscription.expiresAt < new Date()) {
      return res.status(400).json({ message: "Subscription has expired" });
    }

    // Deduct based on type
    if (type === "ride") {
      if (subscription.ridesRemaining !== undefined) {
        if (subscription.ridesRemaining <= 0) {
          return res.status(400).json({ message: "No rides remaining in subscription" });
        }
        subscription.ridesRemaining--;
      }
      // If undefined (unlimited), don't deduct
    } else if (type === "delivery") {
      if (subscription.deliveriesRemaining <= 0) {
        return res.status(400).json({ message: "No deliveries remaining in subscription" });
      }
      subscription.deliveriesRemaining--;
    } else {
      return res.status(400).json({ message: "Invalid type. Must be 'ride' or 'delivery'" });
    }

    db.subscriptions.set(subscriptionId, subscription);

    return res.json({
      message: `Subscription ${type} used successfully`,
      ridesRemaining: subscription.ridesRemaining,
      deliveriesRemaining: subscription.deliveriesRemaining,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to use subscription" });
  }
});

// Cancel subscription
subscriptionsRouter.delete("/:subscriptionId", async (req, res) => {
  const { subscriptionId } = req.params;

  try {
    if (!db.subscriptions) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    const subscription = db.subscriptions.get(subscriptionId);
    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    // Set autoRenew to false (let it expire naturally)
    subscription.autoRenew = false;
    db.subscriptions.set(subscriptionId, subscription);

    // Update user
    const user = db.users.get(subscription.userId);
    if (user) {
      // Keep the plan active until expiry, just disable auto-renew
      await db.users.set(subscription.userId, user);
    }

    return res.json({
      message: "Subscription will not auto-renew",
      expiresAt: subscription.expiresAt,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to cancel subscription" });
  }
});

// Reactivate auto-renewal
subscriptionsRouter.patch("/:subscriptionId/reactivate", async (req, res) => {
  const { subscriptionId } = req.params;

  try {
    if (!db.subscriptions) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    const subscription = db.subscriptions.get(subscriptionId);
    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    subscription.autoRenew = true;
    db.subscriptions.set(subscriptionId, subscription);

    return res.json({
      message: "Auto-renewal reactivated",
      subscription,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to reactivate subscription" });
  }
});
