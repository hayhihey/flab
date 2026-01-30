import Stripe from "stripe";
import { config } from "../config";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-12-16.acacia" as any
});

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed";
  clientSecret?: string;
}

/**
 * Create a payment intent for a ride
 */
export async function createPaymentIntent(
  rideId: string,
  amountCents: number,
  description: string
): Promise<PaymentIntent> {
  try {
    const intent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: "usd",
      description,
      metadata: {
        rideId
      },
      automatic_payment_methods: {
        enabled: true
      }
    });

    return {
      id: intent.id,
      amount: intent.amount,
      currency: intent.currency,
      status: intent.status === "succeeded" ? "completed" : (intent.status as "pending" | "failed"),
      clientSecret: intent.client_secret || undefined
    };
  } catch (error) {
    console.error("Failed to create payment intent:", error);
    throw new Error(`Payment intent creation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Confirm payment intent (called after client-side payment)
 */
export async function confirmPaymentIntent(paymentIntentId: string): Promise<PaymentIntent> {
  try {
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return {
      id: intent.id,
      amount: intent.amount,
      currency: intent.currency,
      status: intent.status === "succeeded" ? "completed" : (intent.status as "pending" | "failed"),
      clientSecret: intent.client_secret || undefined
    };
  } catch (error) {
    console.error("Failed to confirm payment intent:", error);
    throw new Error(`Payment intent confirmation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Create a transfer to driver account
 */
export async function transferToDriver(
  driverId: string,
  amountCents: number,
  description: string
): Promise<{ transferId: string; amount: number; status: string }> {
  try {
    // In production, drivers would have connected Stripe accounts
    // For now, we'll just log the transfer intent
    console.log(`Transfer to driver ${driverId}: ${amountCents / 100} USD - ${description}`);

    // Return a mock transfer for now
    return {
      transferId: `transfer_${Date.now()}`,
      amount: amountCents,
      status: "pending"
    };
  } catch (error) {
    console.error("Failed to transfer funds to driver:", error);
    throw new Error(`Driver transfer failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Refund a payment
 */
export async function refundPayment(paymentIntentId: string, amountCents?: number): Promise<{ refundId: string; amount: number; status: string }> {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amountCents
    });

    return {
      refundId: refund.id,
      amount: refund.amount,
      status: refund.status || "succeeded"
    };
  } catch (error) {
    console.error("Failed to refund payment:", error);
    throw new Error(`Refund failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export { stripe };
