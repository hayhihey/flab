import { config as loadEnv } from "dotenv";
import { z } from "zod";
import { RuntimeSettings } from "./types";

loadEnv();

const envSchema = z.object({
  PORT: z.string().optional(),
  BASE_FARE: z.string().optional(),
  DISTANCE_RATE: z.string().optional(),
  TIME_RATE: z.string().optional(),
  COMMISSION_PERCENT: z.string().optional(),
  ALLOWED_ORIGINS: z.string().optional()
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration", parsed.error.format());
  process.exit(1);
}

const toNumber = (value: string | undefined, fallback: number) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

export const config = {
  port: parsed.data.PORT ?? "4000",
  allowedOrigins: parsed.data.ALLOWED_ORIGINS?.split(",").map((v) => v.trim()).filter(Boolean) ?? ["*"],
  defaults: {
    baseFare: toNumber(parsed.data.BASE_FARE, 1000), // ₦1000 base fare
    distanceRate: toNumber(parsed.data.DISTANCE_RATE, 300), // ₦300 per km
    timeRate: toNumber(parsed.data.TIME_RATE, 40), // ₦40 per minute
    commissionPercent: toNumber(parsed.data.COMMISSION_PERCENT, 20)
  } satisfies RuntimeSettings
};
