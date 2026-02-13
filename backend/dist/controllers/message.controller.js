"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMessage = exports.markMessageRead = exports.getMessageById = exports.getMessagesBetweenUsers = exports.createMessage = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const LocalDb_1 = require("../db/LocalDb");
const ErrorResponse_1 = __importDefault(require("../utils/ErrorResponse"));
const Notification_1 = require("../utils/Notification");
const __1 = require("..");
exports.createMessage = (0, express_async_handler_1.default)(async (req, res, next) => {
    const LocalMessageModel = (0, LocalDb_1.getLocalMessageModel)();
    const LocalConversationModel = (0, LocalDb_1.getLocalConversationModel)();
    const senderId = req.session.user?._id;
    const { receiverId, content } = req.body;
    if (!senderId) {
        return next(new ErrorResponse_1.default("Not authorized", 401));
    }
    if (!receiverId || !content?.trim()) {
        return next(new ErrorResponse_1.default("Receiver and content are required", 400));
    }
    if (senderId === receiverId) {
        return next(new ErrorResponse_1.default("You cannot message yourself", 400));
    }
    let conversation = await LocalConversationModel.findOne({
        participants: { $all: [senderId, receiverId] },
    });
    if (!conversation) {
        conversation = await LocalConversationModel.create({
            participants: [senderId, receiverId],
        });
    }
    const message = await LocalMessageModel.create({
        senderId,
        receiverId,
        conversationId: conversation._id,
        content: content.trim(),
    });
    await (0, Notification_1.createNotificationUtil)({
        sender: senderId,
        recipient: receiverId,
        message: `${req.session.user?.name} sent you a message`,
        type: "NEW_MESSAGE",
        link: message._id,
    }, LocalDb_1.getLocalNotificationModel);
    __1.io.to(`user:${receiverId}`).emit("new_message", message);
    res.status(201).json({
        success: true,
        data: message,
    });
});
exports.getMessagesBetweenUsers = (0, express_async_handler_1.default)(async (req, res, next) => {
    const LocalMessageModel = (0, LocalDb_1.getLocalMessageModel)();
    const LocalConversationModel = (0, LocalDb_1.getLocalConversationModel)();
    const userId = req.session.user?._id;
    const { userId: otherUserId } = req.params;
    if (!userId) {
        return next(new ErrorResponse_1.default("Not authorized", 401));
    }
    const conversation = await LocalConversationModel.findOne({
        participants: { $all: [userId, otherUserId] },
    });
    if (!conversation) {
        res.status(200).json({
            success: true,
            count: 0,
            data: [],
        });
        return;
    }
    const messages = await LocalMessageModel.find({
        conversationId: conversation._id,
    })
        .populate("senderId", "_id name email avatarUrl role isOnline")
        .populate("receiverId", "_id name email avatarUrl role isOnline")
        .sort({ createdAt: 1 });
    res.status(200).json({
        success: true,
        count: messages.length,
        data: messages,
    });
});
exports.getMessageById = (0, express_async_handler_1.default)(async (req, res, next) => {
    const LocalMessageModel = (0, LocalDb_1.getLocalMessageModel)();
    const userId = req.session.user?._id;
    const { messageId } = req.params;
    if (!userId) {
        return next(new ErrorResponse_1.default("Not authorized", 401));
    }
    const message = await LocalMessageModel.findOne({
        _id: messageId,
        $or: [{ senderId: userId }, { receiverId: userId }],
    })
        .populate("senderId", "_id name email avatarUrl role isOnline")
        .populate("receiverId", "_id name email avatarUrl role isOnline");
    if (!message) {
        return next(new ErrorResponse_1.default("Message not found", 404));
    }
    res.status(200).json({
        success: true,
        data: message,
    });
});
exports.markMessageRead = (0, express_async_handler_1.default)(async (req, res, next) => {
    const LocalMessageModel = (0, LocalDb_1.getLocalMessageModel)();
    const userId = req.session.user?._id;
    const { messageId } = req.params;
    if (!userId) {
        return next(new ErrorResponse_1.default("Not authorized", 401));
    }
    const message = await LocalMessageModel.findOneAndUpdate({ _id: messageId, receiverId: userId }, { isRead: true }, { new: true });
    if (!message) {
        return next(new ErrorResponse_1.default("Message not found", 404));
    }
    res.status(200).json({
        success: true,
        data: message,
    });
});
exports.deleteMessage = (0, express_async_handler_1.default)(async (req, res, next) => {
    const LocalMessageModel = (0, LocalDb_1.getLocalMessageModel)();
    const userId = req.session.user?._id;
    const { messageId } = req.params;
    if (!userId) {
        return next(new ErrorResponse_1.default("Not authorized", 401));
    }
    const message = await LocalMessageModel.findOneAndDelete({
        _id: messageId,
        $or: [{ senderId: userId }, { receiverId: userId }],
    });
    if (!message) {
        return next(new ErrorResponse_1.default("Message not found", 404));
    }
    res.status(200).json({
        success: true,
        message: "Message deleted successfully",
    });
});
