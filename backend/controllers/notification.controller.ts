import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { getLocalNotificationModel } from "../db/LocalDb";
import ErrorResponse from "../utils/ErrorResponse";

export const getUserNotifications = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const LocalNotificationModel = getLocalNotificationModel();
        const userId = req.session.user?._id;

        if (!userId) {
            return next(new ErrorResponse("Not authorized", 401));
        }

        const notifications = await LocalNotificationModel.find({
            recipient: userId,
        })
            .populate(
                "sender",
                "_id name email avatarUrl role isOnline createdAt",
            )
            .sort({ createdAt: -1 })
            .limit(50);

        const unreadCount = await LocalNotificationModel.countDocuments({
            recipient: userId,
            isRead: false,
        });

        res.status(200).json({
            success: true,
            unreadCount,
            data: notifications,
        });
    },
);

export const markNotificationRead = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const LocalNotificationModel = getLocalNotificationModel();
        const { notificationId } = req.params;
        const userId = req.session.user?._id;

        const notification = await LocalNotificationModel.findOneAndUpdate(
            { _id: notificationId, recipient: userId },
            { isRead: true },
            { new: true },
        );

        if (!notification) {
            return next(new ErrorResponse("Notification not found", 404));
        }

        res.status(200).json({
            success: true,
            data: notification,
        });
    },
);

export const markAllNotificationsRead = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const LocalNotificationModel = getLocalNotificationModel();
        const userId = req.session.user?._id;

        await LocalNotificationModel.updateMany(
            { recipient: userId, isRead: false },
            { isRead: true },
        );

        res.status(200).json({
            success: true,
            message: "All notifications marked as read",
        });
    },
);
