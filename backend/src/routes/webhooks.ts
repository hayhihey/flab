import { Router, raw } from "express";
import { z } from "zod";
import { store } from "../store";
import { stripe } from "../utils/stripe";

export const webhookRouter = Router();

/**
 * Stripe webhook handler - validates Stripe signature and processes payment events
 */
webhookRouter.post(
  "/stripe",
  raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.warn("STRIPE_WEBHOOK_SECRET not configured");
      return res.status(400).json({ message: "Webhook secret not configured" });
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (error) {
      console.error("Webhook signature verification failed:", error);
      return res.status(400).json({
        message: "Webhook signature verification failed",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }

    try {
      switch (event.type) {
        case "payment_intent.succeeded": {
          const paymentIntent = event.data.object as any;
          const rideId = paymentIntent.metadata?.rideId;

          if (rideId) {
            const ride = store.getRide(rideId);
            if (ride) {
              ride.paymentStatus = "completed";
              store.saveRide(ride);
              console.log(`Payment succeeded for ride ${rideId}`);
            }
          }
          break;
        }

        case "payment_intent.payment_failed": {
          const paymentIntent = event.data.object as any;
          const rideId = paymentIntent.metadata?.rideId;

          if (rideId) {
            const ride = store.getRide(rideId);
            if (ride) {
              ride.paymentStatus = "failed";
              store.saveRide(ride);
              console.log(`Payment failed for ride ${rideId}`);
            }
          }
          break;
        }

        case "charge.refunded": {
          const charge = event.data.object as any;
          console.log(`Charge refunded: ${charge.id}`);
          break;
        }

        default: {
          console.log(`Unhandled webhook event: ${event.type}`);
        }
      }

      return res.json({ received: true });
    } catch (error) {
      console.error("Webhook processing error:", error);
      return res.status(500).json({
        message: "Webhook processing failed",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
);
