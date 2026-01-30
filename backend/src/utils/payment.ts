import { PaymentSplit } from "../types";

export const splitPayment = (fare: number, commissionPercent: number): PaymentSplit => {
  const platformShare = Number(((fare * commissionPercent) / 100).toFixed(2));
  const driverShare = Number((fare - platformShare).toFixed(2));
  return {
    totalFare: fare,
    platformShare,
    driverShare,
    commissionPercent
  };
};
