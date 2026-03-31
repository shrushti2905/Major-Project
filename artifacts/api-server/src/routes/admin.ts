import { Router, type IRouter } from "express";
import { db, usersTable, requestsTable } from "@workspace/db";
import { eq, ilike, or, and, ne } from "drizzle-orm";
import { authMiddleware, adminMiddleware, AuthRequest } from "../middlewares/auth";
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

async function formatRequest(req: typeof requestsTable.$inferSelect) {
  const [sender] = await db.select().from(usersTable).where(eq(usersTable.id, req.senderId));
  const [receiver] = await db.select().from(usersTable).where(eq(usersTable.id, req.receiverId));
  return {
    ...req,
    sender: sender ? formatUser(sender) : undefined,
    receiver: receiver ? formatUser(receiver) : undefined,
  };
}

router.get("/admin/users", authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { search, page = "1", limit = "20" } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const offset = (pageNum - 1) * limitNum;

  let allUsers = await db.select().from(usersTable).orderBy(usersTable.createdAt);

  if (search) {
    const s = search.toLowerCase();
    allUsers = allUsers.filter(u =>
      u.name.toLowerCase().includes(s) ||
      u.email.toLowerCase().includes(s) ||
      (u.location && u.location.toLowerCase().includes(s))
    );
  }

  const total = allUsers.length;
  const paginated = allUsers.slice(offset, offset + limitNum);

  res.json({
    users: paginated.map(formatUser),
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
  });
});

router.post("/admin/users/:id/block", authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);

  if (id === req.user!.id) {
    res.status(400).json({ error: "Cannot block yourself" });
    return;
  }

  const [user] = await db.update(usersTable)
    .set({ isBlocked: true })
    .where(eq(usersTable.id, id))
    .returning();

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(formatUser(user));
});

router.post("/admin/users/:id/unblock", authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);

  const [user] = await db.update(usersTable)
    .set({ isBlocked: false })
    .where(eq(usersTable.id, id))
    .returning();

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(formatUser(user));
});

router.delete("/admin/users/:id", authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);

  if (id === req.user!.id) {
    res.status(400).json({ error: "Cannot delete yourself" });
    return;
  }

  const [user] = await db.delete(usersTable).where(eq(usersTable.id, id)).returning();
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.sendStatus(204);
});

router.get("/admin/requests", authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, page = "1" } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = 50;
  const offset = (pageNum - 1) * limitNum;

  let allRequests = await db.select().from(requestsTable).orderBy(requestsTable.createdAt);

  if (status) {
    allRequests = allRequests.filter(r => r.status === status);
  }

  const paginated = allRequests.slice(offset, offset + limitNum);
  const formatted = await Promise.all(paginated.map(formatRequest));
  res.json(formatted.reverse());
});

export default router;
