/**
 * DEPRECATED: This file is no longer used.
 * 
 * Authentication has been migrated from phone-based OTP to email-based Supabase Auth.
 * SMS notifications are not currently implemented.
 * 
 * Future: Consider using:
 * - Supabase Auth's built-in email templates for verification
 * - SendGrid, Mailgun, or similar for email notifications
 * - Firebase Cloud Messaging or similar for push notifications
 * - Twilio again for SMS if needed in the future
 */

export async function sendOTP(phoneNumber: string, code: string): Promise<{ success: boolean; messageId?: string; message: string }> {
  return {
    success: false,
    message: "OTP via SMS is deprecated. Use Supabase email authentication instead."
  };
}

export async function sendSMS(
  phoneNumber: string,
  message: string
): Promise<{ success: boolean; messageId?: string; message: string }> {
  return {
    success: false,
    message: "SMS is deprecated. Consider using email or push notifications instead."
  };
}

export async function sendRideStatusUpdate(
  phoneNumber: string,
  rideId: string,
  driverName: string,
  driverPhone: string,
  status: "assigned" | "arriving" | "arrived" | "completed"
): Promise<{ success: boolean; messageId?: string; message: string }> {
  return {
    success: false,
    message: "SMS notifications are deprecated."
  };
}
