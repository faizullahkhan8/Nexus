"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllNotificationsRead = exports.markNotificationRead = exports.getUserNotifications = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const LocalDb_1 = require("../db/LocalDb");
const ErrorResponse_1 = __importDefault(require("../utils/ErrorResponse"));
exports.getUserNotifications = (0, express_async_handler_1.default)(async (req, res, next) => {
    const LocalNotificationModel = (0, LocalDb_1.getLocalNotificationModel)();
    const userId = req.session.user?._id;
    if (!userId) {
        return next(new ErrorResponse_1.default("Not authorized", 401));
    }
    const notifications = await LocalNotificationModel.find({
        recipient: userId,
    })
        .populate("sender", "_id name email avatarUrl role isOnline createdAt")
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
});
exports.markNotificationRead = (0, express_async_handler_1.default)(async (req, res, next) => {
    const LocalNotificationModel = (0, LocalDb_1.getLocalNotificationModel)();
    const { notificationId } = req.params;
    const userId = req.session.user?._id;
    const notification = await LocalNotificationModel.findOneAndUpdate({ _id: notificationId, recipient: userId }, { isRead: true }, { new: true });
    if (!notification) {
        return next(new ErrorResponse_1.default("Notification not found", 404));
    }
    res.status(200).json({
        success: true,
        data: notification,
    });
});
exports.markAllNotificationsRead = (0, express_async_handler_1.default)(async (req, res, next) => {
    const LocalNotificationModel = (0, LocalDb_1.getLocalNotificationModel)();
    const userId = req.session.user?._id;
    await LocalNotificationModel.updateMany({ recipient: userId, isRead: false }, { isRead: true });
    res.status(200).json({
        success: true,
        message: "All notifications marked as read",
    });
});
