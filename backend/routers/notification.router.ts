import { Router } from "express";
import { protect } from "../middlewares/Auth";
import {
    getUserNotifications,
    markAllNotificationsRead,
    markNotificationRead,
} from "../controllers/notification.controller";

const router = Router();

router.get("/get-all", protect, getUserNotifications);
router.put("/:notificationId/read", protect, markNotificationRead);
router.put("/read-all", protect, markAllNotificationsRead);

export default router;
