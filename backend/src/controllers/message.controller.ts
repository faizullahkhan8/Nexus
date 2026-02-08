import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import {
    getLocalConversationModel,
    getLocalMessageModel,
    getLocalNotificationModel,
} from "../db/LocalDb";
import ErrorResponse from "../utils/ErrorResponse";
import { createNotificationUtil } from "../utils/Notification";
import { io } from "..";

export const createMessage = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const LocalMessageModel = getLocalMessageModel();
        const LocalConversationModel = getLocalConversationModel();

        const senderId = req.session.user?._id;
        const { receiverId, content } = req.body;

        if (!senderId) {
            return next(new ErrorResponse("Not authorized", 401));
        }

        if (!receiverId || !content?.trim()) {
            return next(
                new ErrorResponse("Receiver and content are required", 400),
            );
        }

        if (senderId === receiverId) {
            return next(new ErrorResponse("You cannot message yourself", 400));
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

        await createNotificationUtil(
            {
                sender: senderId,
                recipient: receiverId,
                message: `${req.session.user?.name} sent you a message`,
                type: "NEW_MESSAGE",
                link: message._id,
            },
            getLocalNotificationModel,
        );

        io.to(`user:${receiverId}`).emit("new_message", message);

        res.status(201).json({
            success: true,
            data: message,
        });
    },
);

export const getMessagesBetweenUsers = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const LocalMessageModel = getLocalMessageModel();
        const LocalConversationModel = getLocalConversationModel();

        const userId = req.session.user?._id;
        const { userId: otherUserId } = req.params;

        if (!userId) {
            return next(new ErrorResponse("Not authorized", 401));
        }

        const conversation = await LocalConversationModel.findOne({
            participants: { $all: [userId, otherUserId] },
        });

        if (!conversation) {
            return res.status(200).json({
                success: true,
                count: 0,
                data: [],
            });
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
    },
);

export const getMessageById = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const LocalMessageModel = getLocalMessageModel();
        const userId = req.session.user?._id;
        const { messageId } = req.params;

        if (!userId) {
            return next(new ErrorResponse("Not authorized", 401));
        }

        const message = await LocalMessageModel.findOne({
            _id: messageId,
            $or: [{ senderId: userId }, { receiverId: userId }],
        })
            .populate("senderId", "_id name email avatarUrl role isOnline")
            .populate("receiverId", "_id name email avatarUrl role isOnline");

        if (!message) {
            return next(new ErrorResponse("Message not found", 404));
        }

        res.status(200).json({
            success: true,
            data: message,
        });
    },
);

export const markMessageRead = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const LocalMessageModel = getLocalMessageModel();
        const userId = req.session.user?._id;
        const { messageId } = req.params;

        if (!userId) {
            return next(new ErrorResponse("Not authorized", 401));
        }

        const message = await LocalMessageModel.findOneAndUpdate(
            { _id: messageId, receiverId: userId },
            { isRead: true },
            { new: true },
        );

        if (!message) {
            return next(new ErrorResponse("Message not found", 404));
        }

        res.status(200).json({
            success: true,
            data: message,
        });
    },
);

export const deleteMessage = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const LocalMessageModel = getLocalMessageModel();
        const userId = req.session.user?._id;
        const { messageId } = req.params;

        if (!userId) {
            return next(new ErrorResponse("Not authorized", 401));
        }

        const message = await LocalMessageModel.findOneAndDelete({
            _id: messageId,
            $or: [{ senderId: userId }, { receiverId: userId }],
        });

        if (!message) {
            return next(new ErrorResponse("Message not found", 404));
        }

        res.status(200).json({
            success: true,
            message: "Message deleted successfully",
        });
    },
);
