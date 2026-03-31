import { Router, type IRouter } from "express";
import { db, requestsTable, usersTable, notificationsTable } from "@workspace/db";
import { eq, and, or } from "drizzle-orm";
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

async function formatRequest(req: typeof requestsTable.$inferSelect) {
  const [sender] = await db.select().from(usersTable).where(eq(usersTable.id, req.senderId));
  const [receiver] = await db.select().from(usersTable).where(eq(usersTable.id, req.receiverId));
  return {
    ...req,
    sender: sender ? formatUser(sender) : undefined,
    receiver: receiver ? formatUser(receiver) : undefined,
  };
}

router.get("/requests", authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { type = "all", status } = req.query as Record<string, string>;
  const userId = req.user!.id;

  let allRequests = await db.select().from(requestsTable)
    .where(or(eq(requestsTable.senderId, userId), eq(requestsTable.receiverId, userId)))
    .orderBy(requestsTable.createdAt);

  if (type === "sent") {
    allRequests = allRequests.filter(r => r.senderId === userId);
  } else if (type === "received") {
    allRequests = allRequests.filter(r => r.receiverId === userId);
  }

  if (status) {
    allRequests = allRequests.filter(r => r.status === status);
  }

  const formatted = await Promise.all(allRequests.map(formatRequest));
  res.json(formatted);
});

router.post("/requests", authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { receiverId, skillOffered, skillRequested, message } = req.body;
  const senderId = req.user!.id;

  if (!receiverId || !skillOffered || !skillRequested) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  if (receiverId === senderId) {
    res.status(400).json({ error: "Cannot send request to yourself" });
    return;
  }

  const [receiver] = await db.select().from(usersTable).where(eq(usersTable.id, receiverId));
  if (!receiver) {
    res.status(404).json({ error: "Receiver not found" });
    return;
  }

  const existing = await db.select().from(requestsTable)
    .where(and(
      eq(requestsTable.senderId, senderId),
      eq(requestsTable.receiverId, receiverId),
      eq(requestsTable.status, "pending")
    ));

  if (existing.length > 0) {
    res.status(409).json({ error: "Duplicate request", message: "You already have a pending request with this user" });
    return;
  }

  const [sender] = await db.select().from(usersTable).where(eq(usersTable.id, senderId));

  const [newRequest] = await db.insert(requestsTable).values({
    senderId,
    receiverId,
    skillOffered,
    skillRequested,
    message: message || null,
    status: "pending",
  }).returning();

  await db.insert(notificationsTable).values({
    userId: receiverId,
    message: `${sender?.name || "Someone"} wants to swap skills with you — they offer "${skillOffered}" and want "${skillRequested}"`,
    type: "request",
    relatedId: newRequest.id,
    isRead: false,
  });

  const formatted = await formatRequest(newRequest);
  res.status(201).json(formatted);
});

router.get("/requests/:id", authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);

  const [request] = await db.select().from(requestsTable).where(eq(requestsTable.id, id));
  if (!request) {
    res.status(404).json({ error: "Request not found" });
    return;
  }

  const userId = req.user!.id;
  if (request.senderId !== userId && request.receiverId !== userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const formatted = await formatRequest(request);
  res.json(formatted);
});

router.delete("/requests/:id", authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  const userId = req.user!.id;

  const [request] = await db.select().from(requestsTable).where(eq(requestsTable.id, id));
  if (!request) {
    res.status(404).json({ error: "Request not found" });
    return;
  }

  if (request.senderId !== userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  await db.delete(requestsTable).where(eq(requestsTable.id, id));
  res.sendStatus(204);
});

router.post("/requests/:id/accept", authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  const userId = req.user!.id;

  const [request] = await db.select().from(requestsTable).where(eq(requestsTable.id, id));
  if (!request) {
    res.status(404).json({ error: "Request not found" });
    return;
  }

  if (request.receiverId !== userId) {
    res.status(403).json({ error: "Only the receiver can accept" });
    return;
  }

  if (request.status !== "pending") {
    res.status(400).json({ error: "Request is not pending" });
    return;
  }

  const [updated] = await db.update(requestsTable)
    .set({ status: "accepted" })
    .where(eq(requestsTable.id, id))
    .returning();

  const [receiver] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  await db.insert(notificationsTable).values({
    userId: request.senderId,
    message: `${receiver?.name || "Someone"} accepted your skill swap request!`,
    type: "accepted",
    relatedId: id,
    isRead: false,
  });

  const formatted = await formatRequest(updated);
  res.json(formatted);
});

router.post("/requests/:id/reject", authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  const userId = req.user!.id;

  const [request] = await db.select().from(requestsTable).where(eq(requestsTable.id, id));
  if (!request) {
    res.status(404).json({ error: "Request not found" });
    return;
  }

  if (request.receiverId !== userId) {
    res.status(403).json({ error: "Only the receiver can reject" });
    return;
  }

  if (request.status !== "pending") {
    res.status(400).json({ error: "Request is not pending" });
    return;
  }

  const [updated] = await db.update(requestsTable)
    .set({ status: "rejected" })
    .where(eq(requestsTable.id, id))
    .returning();

  const [receiver] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  await db.insert(notificationsTable).values({
    userId: request.senderId,
    message: `${receiver?.name || "Someone"} declined your skill swap request.`,
    type: "rejected",
    relatedId: id,
    isRead: false,
  });

  const formatted = await formatRequest(updated);
  res.json(formatted);
});

router.post("/requests/:id/complete", authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  const userId = req.user!.id;

  const [request] = await db.select().from(requestsTable).where(eq(requestsTable.id, id));
  if (!request) {
    res.status(404).json({ error: "Request not found" });
    return;
  }

  if (request.senderId !== userId && request.receiverId !== userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  if (request.status !== "accepted") {
    res.status(400).json({ error: "Request must be accepted before completing" });
    return;
  }

  const [updated] = await db.update(requestsTable)
    .set({ status: "completed" })
    .where(eq(requestsTable.id, id))
    .returning();

  const otherId = request.senderId === userId ? request.receiverId : request.senderId;
  const [me] = await db.select().from(usersTable).where(eq(usersTable.id, userId));

  await db.insert(notificationsTable).values({
    userId: otherId,
    message: `${me?.name || "Someone"} marked the skill swap as completed. Great exchange!`,
    type: "completed",
    relatedId: id,
    isRead: false,
  });

  const formatted = await formatRequest(updated);
  res.json(formatted);
});

export default router;
