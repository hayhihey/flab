import { Router } from "express";
import { z } from "zod";
import { db } from "../services/db";

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["rider", "driver"] as const),
  name: z.string().min(2).max(60)
});

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const authRouter = Router();

authRouter.post("/sign-up", async (req, res) => {
  const parsed = signUpSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });

  const { email, password, role, name } = parsed.data;

  try {
    // Sign up user with Supabase Auth
    const { user, session } = await db.signUpUser(email, password);

    if (!user?.id || !session?.access_token) {
      return res.status(400).json({ message: "Failed to create user account" });
    }

    // Create rider or driver profile
    let profile;
    if (role === "rider") {
      profile = await db.upsertRider(name, email);
    } else {
      profile = await db.upsertDriver(name, email, "", undefined, "pending");
    }

    return res.status(201).json({
      message: "Sign up successful",
      token: session.access_token,
      user: { id: user.id, email },
      profile
    });
  } catch (error) {
    console.error("Sign up error:", error);
    return res.status(400).json({ message: error instanceof Error ? error.message : "Sign up failed" });
  }
});

authRouter.post("/sign-in", async (req, res) => {
  const parsed = signInSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });

  const { email, password } = parsed.data;

  try {
    const { user, session } = await db.signInUser(email, password);

    if (!user || !session) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Get user profile (rider or driver)
    let profile = await db.getRiderByEmail(email);
    if (!profile) {
      profile = await db.getDriverByEmail(email);
    }

    return res.json({
      message: "Sign in successful",
      token: session.access_token,
      user: { id: user.id, email },
      profile
    });
  } catch (error) {
    console.error("Sign in error:", error);
    return res.status(401).json({ message: "Sign in failed" });
  }
});

authRouter.post("/sign-out", async (req, res) => {
  try {
    await db.signOutUser();
    return res.json({ message: "Signed out successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Sign out failed" });
  }
});
