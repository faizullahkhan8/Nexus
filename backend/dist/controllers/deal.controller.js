"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDealDetails = exports.updateDealStatus = exports.getMyDeals = exports.createDeal = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const LocalDb_1 = require("../db/LocalDb");
const ErrorResponse_1 = __importDefault(require("../utils/ErrorResponse"));
const Notification_1 = require("../utils/Notification");
const DEAL_STATUSES = [
    "prospecting",
    "due_diligence",
    "term_sheet",
    "negotiation",
    "closed_won",
    "closed_lost",
];
const isDealParticipant = (deal, userId) => {
    return (deal.investorId?.toString() === userId ||
        deal.startupId?.toString() === userId);
};
const getCounterPartyId = (deal, userId) => {
    if (deal.investorId?.toString() === userId) {
        return deal.startupId?.toString();
    }
    return deal.investorId?.toString();
};
exports.createDeal = (0, express_async_handler_1.default)(async (req, res, next) => {
    const LocalDealModel = (0, LocalDb_1.getLocalDealModel)();
    if (!LocalDealModel) {
        return next(new ErrorResponse_1.default("Deal model unavailable", 500));
    }
    const sessionUser = req.session.user;
    if (!sessionUser?._id) {
        return next(new ErrorResponse_1.default("Not authorized", 401));
    }
    const userId = sessionUser._id;
    const userRole = sessionUser.role;
    const { investorId: bodyInvestorId, startupId: bodyStartupId, title, amount, equity, stage, status, notes, expectedCloseDate, } = req.body;
    if (!title?.trim()) {
        return next(new ErrorResponse_1.default("Title is required", 400));
    }
    if (!bodyInvestorId || !bodyStartupId) {
        return next(new ErrorResponse_1.default("InvestorId and StartupId are required", 400));
    }
    if (bodyInvestorId === bodyStartupId) {
        return next(new ErrorResponse_1.default("Investor and Startup cannot be the same", 400));
    }
    // Role enforcement
    if ((userRole === "investor" && bodyInvestorId !== userId) ||
        (userRole === "entrepreneur" && bodyStartupId !== userId)) {
        return next(new ErrorResponse_1.default("You are not authorized to create this deal", 403));
    }
    const numericAmount = Number(amount);
    const numericEquity = Number(equity);
    if (Number.isNaN(numericAmount) ||
        Number.isNaN(numericEquity) ||
        numericAmount <= 0 ||
        numericEquity <= 0 ||
        numericEquity > 100) {
        return next(new ErrorResponse_1.default("Amount must be positive and equity must be between 1 and 100", 400));
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
        return next(new ErrorResponse_1.default("Invalid deal stage", 400));
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
    const recipientId = userId === bodyInvestorId ? bodyStartupId : bodyInvestorId;
    await (0, Notification_1.createNotificationUtil)({
        sender: userId,
        recipient: recipientId,
        message: `${sessionUser.name} created a deal: ${deal.title}`,
        type: "DEAL_CREATED",
        link: deal._id,
    }, LocalDb_1.getLocalNotificationModel);
    res.status(201).json({
        success: true,
        message: "Deal created successfully",
        data: populatedDeal,
    });
});
exports.getMyDeals = (0, express_async_handler_1.default)(async (req, res, next) => {
    const LocalDealModel = (0, LocalDb_1.getLocalDealModel)();
    if (!LocalDealModel) {
        return next(new ErrorResponse_1.default("Deal model unavailable", 500));
    }
    const userId = req.session.user?._id;
    const { status } = req.query;
    if (!userId) {
        return next(new ErrorResponse_1.default("Not authorized", 401));
    }
    const query = {
        $or: [{ investorId: userId }, { startupId: userId }],
    };
    if (typeof status === "string" &&
        DEAL_STATUSES.includes(status)) {
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
});
const mongoose_1 = __importDefault(require("mongoose"));
const ALLOWED_STATUSES = [
    "prospecting",
    "due_diligence",
    "term_sheet",
    "negotiation",
    "closed_won",
    "closed_lost",
];
exports.updateDealStatus = (0, express_async_handler_1.default)(async (req, res, next) => {
    const LocalDealModel = (0, LocalDb_1.getLocalDealModel)();
    if (!LocalDealModel) {
        return next(new ErrorResponse_1.default("Deal model unavailable", 500));
    }
    const sessionUser = req.session.user;
    if (!sessionUser?._id) {
        return next(new ErrorResponse_1.default("Not authorized", 401));
    }
    const userId = sessionUser._id;
    const { dealId, status } = req.body;
    if (!dealId || !mongoose_1.default.Types.ObjectId.isValid(dealId)) {
        return next(new ErrorResponse_1.default("Invalid deal ID", 400));
    }
    if (!ALLOWED_STATUSES.includes(status)) {
        return next(new ErrorResponse_1.default("Invalid deal status", 400));
    }
    const deal = await LocalDealModel.findById(dealId);
    if (!deal) {
        return next(new ErrorResponse_1.default("Deal not found", 404));
    }
    const isParticipant = deal.investorId.toString() === userId ||
        deal.startupId.toString() === userId;
    if (!isParticipant) {
        return next(new ErrorResponse_1.default("Not authorized to update this deal", 403));
    }
    if (deal.status === status) {
        return next(new ErrorResponse_1.default("Deal is already in this status", 400));
    }
    deal.status = status;
    deal.lastActivity = new Date();
    await deal.save();
    const updatedDeal = await LocalDealModel.findById(deal._id)
        .populate("investorId", "_id name email avatarUrl role isOnline")
        .populate("startupId", "_id name email avatarUrl role isOnline")
        .populate("createdBy", "_id name email avatarUrl role isOnline");
    const recipientId = deal.investorId.toString() === userId
        ? deal.startupId
        : deal.investorId;
    await (0, Notification_1.createNotificationUtil)({
        sender: userId,
        recipient: recipientId,
        message: `${sessionUser.name} changed deal status to ${status.replace("_", " ")}`,
        type: "DEAL_UPDATED",
        link: deal._id,
    }, LocalDb_1.getLocalNotificationModel);
    res.status(200).json({
        success: true,
        message: "Deal status updated successfully",
        data: updatedDeal,
    });
});
exports.updateDealDetails = (0, express_async_handler_1.default)(async (req, res, next) => {
    const LocalDealModel = (0, LocalDb_1.getLocalDealModel)();
    if (!LocalDealModel) {
        return next(new ErrorResponse_1.default("Deal model unavailable", 500));
    }
    const userId = req.session.user?._id;
    const { dealId, title, amount, equity, stage, notes, expectedCloseDate, } = req.body;
    if (!userId) {
        return next(new ErrorResponse_1.default("Not authorized", 401));
    }
    const deal = await LocalDealModel.findById(dealId);
    if (!deal) {
        return next(new ErrorResponse_1.default("Deal not found", 404));
    }
    if (!isDealParticipant(deal, userId)) {
        return next(new ErrorResponse_1.default("Not authorized to update deal", 403));
    }
    if (title !== undefined) {
        deal.title = String(title).trim();
    }
    if (amount !== undefined) {
        const numericAmount = Number(amount);
        if (Number.isNaN(numericAmount) || numericAmount <= 0) {
            return next(new ErrorResponse_1.default("Amount must be positive", 400));
        }
        deal.amount = numericAmount;
    }
    if (equity !== undefined) {
        const numericEquity = Number(equity);
        if (Number.isNaN(numericEquity) ||
            numericEquity <= 0 ||
            numericEquity > 100) {
            return next(new ErrorResponse_1.default("Equity must be greater than 0 and less than or equal to 100", 400));
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
});
