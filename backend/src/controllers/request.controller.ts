import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import {
    getLocalConversationModel,
    getLocalEntrepreneurModel,
    getLocalNotificationModel,
    getLocalRequestModel,
} from "../db/LocalDb";
import ErrorResponse from "../utils/ErrorResponse";
import { createNotificationUtil } from "../utils/Notification";
import { IEntrepreneur } from "../models/Entrepreneur.model";

export const createRequest = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const LocalRequestModel = getLocalRequestModel();

        const { receiverId, type, message, documentId } = req.body;
        const senderId = req.session.user?._id;

        if (!senderId) {
            return next(new ErrorResponse("Not authorized", 401));
        }

        if (senderId === receiverId) {
            return next(
                new ErrorResponse("You cannot send a request to yourself", 400),
            );
        }

        const existingRequest = await LocalRequestModel.findOne({
            senderId,
            receiverId,
            type,
            status: "pending",
        });

        if (existingRequest) {
            return next(
                new ErrorResponse("A pending request already exists", 400),
            );
        }

        const request = await LocalRequestModel.create({
            senderId,
            receiverId,
            type,
            message,
            documentId: type === "DocumentAccess" ? documentId : undefined,
        });

        await createNotificationUtil(
            {
                sender: senderId,
                recipient: receiverId,
                message: `${req.session.user?.name} sent you a connection request`,
                type: "CONNECTION_REQUEST",
                link: request._id,
            },
            getLocalNotificationModel,
        );

        res.status(201).json({
            success: true,
            message: "Request sent successfully",
            data: request,
        });
    },
);

export const getAllUserRequests = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const LocalRequestModel = getLocalRequestModel();
        const userId = req.session.user?._id;

        if (!userId) {
            return next(new ErrorResponse("Not authorized", 401));
        }

        const requests = await LocalRequestModel.find({
            $or: [{ senderId: userId }, { receiverId: userId }],
        })
            .populate("senderId", "_id name email avatarUrl role isOnline")
            .populate("receiverId", "_id name email avatarUrl role isOnline")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: requests.length,
            requests,
        });
    },
);

export const updateRequestStatus = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const LocalRequestModel = getLocalRequestModel();
        const LocalEntrepreneurModel = getLocalEntrepreneurModel();
        const LocalConversationModel = getLocalConversationModel();

        const { requestId, status } = req.body;
        const userId = req.session.user?._id;

        if (!userId) {
            return next(new ErrorResponse("Not authorized", 401));
        }

        const request = await LocalRequestModel.findById(requestId);

        if (!request) {
            return next(new ErrorResponse("Request not found", 404));
        }

        if (request.receiverId.toString() !== userId) {
            return next(
                new ErrorResponse(
                    "You are not authorized to update this request",
                    403,
                ),
            );
        }

        request.status = status;
        await request.save();

        let entrepreneur: IEntrepreneur;

        if (status === "accepted") {
            entrepreneur = (await LocalEntrepreneurModel.findOneAndUpdate(
                { user: userId },
                { $addToSet: { connections: request.senderId } },
            )) as IEntrepreneur;

            await LocalConversationModel.create({
                participants: [request.receiverId, request.senderId],
            });

            await createNotificationUtil(
                {
                    sender: req.session.user?._id,
                    recipient: request.senderId,
                    message: `${entrepreneur.startupName} accepted your connection request`,
                    type: "REQUEST_ACCEPTED",
                    link: request._id,
                },
                getLocalNotificationModel,
            );
        }

        res.status(200).json({
            success: true,
            message: `Request ${status} successfully`,
            data: request,
        });
    },
);
