import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import requestsRouter from "./requests";
import notificationsRouter from "./notifications";
import adminRouter from "./admin";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(requestsRouter);
router.use(notificationsRouter);
router.use(adminRouter);
router.use(statsRouter);

export default router;
