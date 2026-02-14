import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { getLocalDealModel, getLocalNotificationModel } from "../db/LocalDb";
import ErrorResponse from "../utils/ErrorResponse";
import { createNotificationUtil } from "../utils/Notification";
import { DealStatus } from "../models/Deal.model";

const DEAL_STATUSES: DealStatus[] = [
    "prospecting",
    "due_diligence",
    "term_sheet",
    "negotiation",
    "closed_won",
    "closed_lost",
];

const isDealParticipant = (deal: any, userId: string) => {
    return (
        deal.investorId?.toString() === userId ||
        deal.startupId?.toString() === userId
    );
};

const getCounterPartyId = (deal: any, userId: string) => {
    if (deal.investorId?.toString() === userId) {
        return deal.startupId?.toString();
    }
    return deal.investorId?.toString();
};

export const createDeal = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const LocalDealModel = getLocalDealModel();

        if (!LocalDealModel) {
            return next(new ErrorResponse("Deal model unavailable", 500));
        }

        const sessionUser = req.session.user;
        if (!sessionUser?._id) {
            return next(new ErrorResponse("Not authorized", 401));
        }

        const userId = sessionUser._id;
        const userRole = sessionUser.role;

        const {
            investorId: bodyInvestorId,
            startupId: bodyStartupId,
            title,
            amount,
            equity,
            stage,
            status,
            notes,
            expectedCloseDate,
        } = req.body;

        if (!title?.trim()) {
            return next(new ErrorResponse("Title is required", 400));
        }

        if (!bodyInvestorId || !bodyStartupId) {
            return next(
                new ErrorResponse("InvestorId and StartupId are required", 400),
            );
        }

        if (bodyInvestorId === bodyStartupId) {
            return next(
                new ErrorResponse(
                    "Investor and Startup cannot be the same",
                    400,
                ),
            );
        }

        // Role enforcement
        if (
            (userRole === "investor" && bodyInvestorId !== userId) ||
            (userRole === "entrepreneur" && bodyStartupId !== userId)
        ) {
            return next(
                new ErrorResponse(
                    "You are not authorized to create this deal",
                    403,
                ),
            );
        }

        const numericAmount = Number(amount);
        const numericEquity = Number(equity);

        if (
            Number.isNaN(numericAmount) ||
            Number.isNaN(numericEquity) ||
            numericAmount <= 0 ||
            numericEquity <= 0 ||
            numericEquity > 100
        ) {
            return next(
                new ErrorResponse(
                    "Amount must be positive and equity must be between 1 and 100",
                    400,
                ),
            );
        }

        const allowedStages = [
            "Pre-seed",
            "Seed",
            "Series A",
            "Series B",
            "Series C",
            "Growth",
        ];

        if (!allowedStages.includes(stage)) {
            return next(new ErrorResponse("Invalid deal stage", 400));
        }

        const deal = await LocalDealModel.create({
            title: title.trim(),
            investorId: bodyInvestorId,
            startupId: bodyStartupId,
            amount: numericAmount,
            equity: numericEquity,
            stage,
            status: status ?? "prospecting",
            notes: notes?.trim(),
            expectedCloseDate: expectedCloseDate
                ? new Date(expectedCloseDate)
                : undefined,
            createdBy: userId,
            lastActivity: new Date(),
        });

        const populatedDeal = await LocalDealModel.findById(deal._id)
            .populate("investorId", "_id name email avatarUrl role isOnline")
            .populate("startupId", "_id name email avatarUrl role isOnline")
            .populate("createdBy", "_id name email avatarUrl role isOnline");

        const recipientId =
            userId === bodyInvestorId ? bodyStartupId : bodyInvestorId;

        await createNotificationUtil(
            {
                sender: userId,
                recipient: recipientId,
                message: `${sessionUser.name} created a deal: ${deal.title}`,
                type: "DEAL_CREATED",
                link: deal._id,
            },
            getLocalNotificationModel,
        );

        res.status(201).json({
            success: true,
            message: "Deal created successfully",
            data: populatedDeal,
        });
    },
);

export const getMyDeals = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const LocalDealModel = getLocalDealModel();

        if (!LocalDealModel) {
            return next(new ErrorResponse("Deal model unavailable", 500));
        }

        const userId = req.session.user?._id;
        const { status } = req.query;

        if (!userId) {
            return next(new ErrorResponse("Not authorized", 401));
        }

        const query: any = {
            $or: [{ investorId: userId }, { startupId: userId }],
        };

        if (
            typeof status === "string" &&
            DEAL_STATUSES.includes(status as DealStatus)
        ) {
            query.status = status;
        }

        const deals = await LocalDealModel.find(query)
            .populate("investorId", "_id name email avatarUrl role isOnline")
            .populate("startupId", "_id name email avatarUrl role isOnline")
            .populate("createdBy", "_id name email avatarUrl role isOnline")
            .sort({ updatedAt: -1 });

        res.status(200).json({
            success: true,
            count: deals.length,
            deals,
        });
    },
);

import mongoose from "mongoose";

const ALLOWED_STATUSES = [
    "prospecting",
    "due_diligence",
    "term_sheet",
    "negotiation",
    "closed_won",
    "closed_lost",
] as const;

export const updateDealStatus = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const LocalDealModel = getLocalDealModel();

        if (!LocalDealModel) {
            return next(new ErrorResponse("Deal model unavailable", 500));
        }

        const sessionUser = req.session.user;
        if (!sessionUser?._id) {
            return next(new ErrorResponse("Not authorized", 401));
        }

        const userId = sessionUser._id;
        const { dealId, status } = req.body;

        if (!dealId || !mongoose.Types.ObjectId.isValid(dealId)) {
            return next(new ErrorResponse("Invalid deal ID", 400));
        }

        if (!ALLOWED_STATUSES.includes(status)) {
            return next(new ErrorResponse("Invalid deal status", 400));
        }

        const deal = await LocalDealModel.findById(dealId);

        if (!deal) {
            return next(new ErrorResponse("Deal not found", 404));
        }

        const isParticipant =
            deal.investorId.toString() === userId ||
            deal.startupId.toString() === userId;

        if (!isParticipant) {
            return next(
                new ErrorResponse("Not authorized to update this deal", 403),
            );
        }

        if (deal.status === status) {
            return next(
                new ErrorResponse("Deal is already in this status", 400),
            );
        }

        deal.status = status;
        deal.lastActivity = new Date();

        await deal.save();

        const updatedDeal = await LocalDealModel.findById(deal._id)
            .populate("investorId", "_id name email avatarUrl role isOnline")
            .populate("startupId", "_id name email avatarUrl role isOnline")
            .populate("createdBy", "_id name email avatarUrl role isOnline");

        const recipientId =
            deal.investorId.toString() === userId
                ? deal.startupId
                : deal.investorId;

        await createNotificationUtil(
            {
                sender: userId,
                recipient: recipientId,
                message: `${sessionUser.name} changed deal status to ${status.replace(
                    "_",
                    " ",
                )}`,
                type: "DEAL_UPDATED",
                link: deal._id,
            },
            getLocalNotificationModel,
        );

        res.status(200).json({
            success: true,
            message: "Deal status updated successfully",
            data: updatedDeal,
        });
    },
);

export const updateDealDetails = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const LocalDealModel = getLocalDealModel();

        if (!LocalDealModel) {
            return next(new ErrorResponse("Deal model unavailable", 500));
        }

        const userId = req.session.user?._id;
        const {
            dealId,
            title,
            amount,
            equity,
            stage,
            notes,
            expectedCloseDate,
        } = req.body;

        if (!userId) {
            return next(new ErrorResponse("Not authorized", 401));
        }

        const deal = await LocalDealModel.findById(dealId);

        if (!deal) {
            return next(new ErrorResponse("Deal not found", 404));
        }

        if (!isDealParticipant(deal, userId)) {
            return next(
                new ErrorResponse("Not authorized to update deal", 403),
            );
        }

        if (title !== undefined) {
            deal.title = String(title).trim();
        }

        if (amount !== undefined) {
            const numericAmount = Number(amount);
            if (Number.isNaN(numericAmount) || numericAmount <= 0) {
                return next(new ErrorResponse("Amount must be positive", 400));
            }
            deal.amount = numericAmount;
        }

        if (equity !== undefined) {
            const numericEquity = Number(equity);
            if (
                Number.isNaN(numericEquity) ||
                numericEquity <= 0 ||
                numericEquity > 100
            ) {
                return next(
                    new ErrorResponse(
                        "Equity must be greater than 0 and less than or equal to 100",
                        400,
                    ),
                );
            }
            deal.equity = numericEquity;
        }

        if (stage !== undefined) {
            deal.stage = stage;
        }

        if (notes !== undefined) {
            deal.notes = notes;
        }

        if (expectedCloseDate !== undefined) {
            deal.expectedCloseDate = expectedCloseDate
                ? new Date(expectedCloseDate)
                : undefined;
        }

        deal.lastActivity = new Date();
        await deal.save();

        const updatedDeal = await LocalDealModel.findById(deal._id)
            .populate("investorId", "_id name email avatarUrl role isOnline")
            .populate("startupId", "_id name email avatarUrl role isOnline")
            .populate("createdBy", "_id name email avatarUrl role isOnline");

        res.status(200).json({
            success: true,
            message: "Deal updated successfully",
            data: updatedDeal,
        });
    },
);
