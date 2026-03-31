import { Router, type IRouter } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { authMiddleware, AuthRequest } from "../middlewares/auth";
import { Response } from "express";

const router: IRouter = Router();

router.get("/notifications", authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const notifications = await db.select().from(notificationsTable)
    .where(eq(notificationsTable.userId, req.user!.id))
    .orderBy(notificationsTable.createdAt);

  res.json(notifications.reverse());
});

router.post("/notifications/:id/read", authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);

  const [notification] = await db.select().from(notificationsTable)
    .where(and(eq(notificationsTable.id, id), eq(notificationsTable.userId, req.user!.id)));

  if (!notification) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }

  const [updated] = await db.update(notificationsTable)
    .set({ isRead: true })
    .where(eq(notificationsTable.id, id))
    .returning();

  res.json(updated);
});

router.post("/notifications/read-all", authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  await db.update(notificationsTable)
    .set({ isRead: true })
    .where(eq(notificationsTable.userId, req.user!.id));

  res.json({ success: true, message: "All notifications marked as read" });
});

export default router;
