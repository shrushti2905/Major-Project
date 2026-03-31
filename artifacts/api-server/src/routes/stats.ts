import { Router, type IRouter } from "express";
import { db, usersTable, requestsTable, notificationsTable } from "@workspace/db";
import { eq, sql, and, gte } from "drizzle-orm";
import { authMiddleware, AuthRequest } from "../middlewares/auth";
import { Response } from "express";

const router: IRouter = Router();

router.get("/stats", authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const [totalUsersResult] = await db.select({ count: sql<number>`count(*)` }).from(usersTable);
  const [totalRequestsResult] = await db.select({ count: sql<number>`count(*)` }).from(requestsTable);
  const [completedResult] = await db.select({ count: sql<number>`count(*)` }).from(requestsTable).where(eq(requestsTable.status, "completed"));
  const [pendingResult] = await db.select({ count: sql<number>`count(*)` }).from(requestsTable).where(eq(requestsTable.status, "pending"));
  const [acceptedResult] = await db.select({ count: sql<number>`count(*)` }).from(requestsTable).where(eq(requestsTable.status, "accepted"));

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [activeResult] = await db.select({ count: sql<number>`count(*)` })
    .from(usersTable)
    .where(gte(usersTable.createdAt, thirtyDaysAgo));

  res.json({
    totalUsers: Number(totalUsersResult?.count || 0),
    totalRequests: Number(totalRequestsResult?.count || 0),
    completedSwaps: Number(completedResult?.count || 0),
    activeUsers: Number(activeResult?.count || 0),
    pendingRequests: Number(pendingResult?.count || 0),
    acceptedRequests: Number(acceptedResult?.count || 0),
  });
});

router.get("/stats/recent-activity", authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const recentRequests = await db.select().from(requestsTable)
    .orderBy(requestsTable.createdAt)
    .limit(20);

  const activity = await Promise.all(
    recentRequests.reverse().map(async (r) => {
      const [sender] = await db.select().from(usersTable).where(eq(usersTable.id, r.senderId));
      let description = "";
      if (r.status === "pending") {
        description = `${sender?.name || "A user"} sent a skill swap request for "${r.skillOffered}"`;
      } else if (r.status === "accepted") {
        description = `A skill swap for "${r.skillOffered}" was accepted`;
      } else if (r.status === "completed") {
        description = `A skill swap for "${r.skillOffered}" was completed`;
      } else {
        description = `A skill swap request was ${r.status}`;
      }
      return {
        id: r.id,
        type: r.status,
        description,
        userName: sender?.name || "Unknown",
        createdAt: r.createdAt,
      };
    })
  );

  res.json(activity);
});

router.get("/stats/top-skills", authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const allUsers = await db.select().from(usersTable);
  const skillCounts: Record<string, number> = {};

  for (const user of allUsers) {
    for (const skill of user.skillsOffered) {
      const normalized = skill.trim().toLowerCase();
      if (normalized) skillCounts[normalized] = (skillCounts[normalized] || 0) + 1;
    }
  }

  const sorted = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([skill, count]) => ({
      skill: skill.charAt(0).toUpperCase() + skill.slice(1),
      count,
    }));

  res.json(sorted);
});

export default router;
