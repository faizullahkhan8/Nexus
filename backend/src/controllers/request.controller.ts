import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { getLocalRequestModel } from "../db/LocalDb";
import ErrorResponse from "../utils/ErrorResponse";

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
            .populate("senderId", "name email avatarUrl")
            .populate("receiverId", "name email avatarUrl")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: requests.length,
            requests,
        });
    },
);
