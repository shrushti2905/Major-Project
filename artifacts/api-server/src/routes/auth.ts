import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authMiddleware, generateToken, AuthRequest } from "../middlewares/auth";
import { Response } from "express";

const router: IRouter = Router();

function formatUser(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    bio: user.bio,
    location: user.location,
    profileImage: user.profileImage,
    skillsOffered: user.skillsOffered || [],
    skillsWanted: user.skillsWanted || [],
    isBlocked: user.isBlocked,
    createdAt: user.createdAt,
  };
}

router.post("/auth/signup", async (req, res: Response): Promise<void> => {
  const { name, email, password, bio, location, skillsOffered, skillsWanted } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ error: "Missing required fields", message: "Name, email, and password are required" });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: "Validation error", message: "Password must be at least 6 characters" });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: "Validation error", message: "Invalid email format" });
    return;
  }

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase()));
  if (existing.length > 0) {
    res.status(409).json({ error: "Conflict", message: "Email already in use" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const [user] = await db.insert(usersTable).values({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role: "user",
    bio: bio || null,
    location: location || null,
    skillsOffered: skillsOffered || [],
    skillsWanted: skillsWanted || [],
    isBlocked: false,
  }).returning();

  const token = generateToken({ id: user.id, email: user.email, role: user.role });
  res.status(201).json({ token, user: formatUser(user) });
});

router.post("/auth/login", async (req, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Missing fields", message: "Email and password are required" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase()));

  if (!user) {
    res.status(401).json({ error: "Unauthorized", message: "Invalid email or password" });
    return;
  }

  if (user.isBlocked) {
    res.status(403).json({ error: "Forbidden", message: "Your account has been blocked" });
    return;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(401).json({ error: "Unauthorized", message: "Invalid email or password" });
    return;
  }

  const token = generateToken({ id: user.id, email: user.email, role: user.role });
  res.json({ token, user: formatUser(user) });
});

router.get("/auth/me", authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id));
  if (!user) {
    res.status(401).json({ error: "Unauthorized", message: "User not found" });
    return;
  }
  res.json(formatUser(user));
});

export default router;
