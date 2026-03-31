import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, ilike, or, sql, and, ne } from "drizzle-orm";
import { authMiddleware, AuthRequest } from "../middlewares/auth";
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

router.get("/users", authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { search, skill, page = "1", limit = "20" } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const offset = (pageNum - 1) * limitNum;

  let conditions = [ne(usersTable.id, req.user!.id), eq(usersTable.isBlocked, false)];

  const allUsers = await db.select().from(usersTable)
    .where(and(...conditions))
    .orderBy(usersTable.createdAt)
    .limit(1000);

  let filtered = allUsers;

  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(u =>
      u.name.toLowerCase().includes(s) ||
      u.email.toLowerCase().includes(s) ||
      (u.bio && u.bio.toLowerCase().includes(s)) ||
      (u.location && u.location.toLowerCase().includes(s)) ||
      u.skillsOffered.some(sk => sk.toLowerCase().includes(s)) ||
      u.skillsWanted.some(sk => sk.toLowerCase().includes(s))
    );
  }

  if (skill) {
    const s = skill.toLowerCase();
    filtered = filtered.filter(u =>
      u.skillsOffered.some(sk => sk.toLowerCase().includes(s)) ||
      u.skillsWanted.some(sk => sk.toLowerCase().includes(s))
    );
  }

  const total = filtered.length;
  const paginated = filtered.slice(offset, offset + limitNum);

  res.json({
    users: paginated.map(formatUser),
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
  });
});

router.get("/users/matches", authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const [currentUser] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id));
  if (!currentUser) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const allUsers = await db.select().from(usersTable)
    .where(and(ne(usersTable.id, req.user!.id), eq(usersTable.isBlocked, false)));

  const wantedByMe = currentUser.skillsWanted || [];
  const offeredByMe = currentUser.skillsOffered || [];

  const matches = allUsers
    .map(user => {
      const matchingSkills = user.skillsOffered.filter(skill =>
        wantedByMe.some(w => w.toLowerCase() === skill.toLowerCase())
      );
      const reverseMatch = user.skillsWanted.filter(skill =>
        offeredByMe.some(o => o.toLowerCase() === skill.toLowerCase())
      );
      const matchScore = matchingSkills.length * 2 + reverseMatch.length;
      return { ...formatUser(user), matchingSkills, matchScore };
    })
    .filter(u => u.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);

  res.json(matches);
});

router.get("/users/:id", authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!user) {
    res.status(404).json({ error: "Not found", message: "User not found" });
    return;
  }

  res.json(formatUser(user));
});

router.put("/users/profile", authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, bio, location, profileImage, skillsOffered, skillsWanted } = req.body;

  const updateData: Partial<typeof usersTable.$inferInsert> = {};
  if (name != null) updateData.name = name;
  if (bio != null) updateData.bio = bio;
  if (location != null) updateData.location = location;
  if (profileImage != null) updateData.profileImage = profileImage;
  if (skillsOffered != null) updateData.skillsOffered = skillsOffered;
  if (skillsWanted != null) updateData.skillsWanted = skillsWanted;

  const [user] = await db.update(usersTable)
    .set(updateData)
    .where(eq(usersTable.id, req.user!.id))
    .returning();

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(formatUser(user));
});

export default router;
