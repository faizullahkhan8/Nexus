"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRequestStatus = exports.getAllUserRequests = exports.createRequest = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const LocalDb_1 = require("../db/LocalDb");
const ErrorResponse_1 = __importDefault(require("../utils/ErrorResponse"));
const Notification_1 = require("../utils/Notification");
exports.createRequest = (0, express_async_handler_1.default)(async (req, res, next) => {
    const LocalRequestModel = (0, LocalDb_1.getLocalRequestModel)();
    const { receiverId, type, message, documentId } = req.body;
    const senderId = req.session.user?._id;
    if (!senderId) {
        return next(new ErrorResponse_1.default("Not authorized", 401));
    }
    if (senderId === receiverId) {
        return next(new ErrorResponse_1.default("You cannot send a request to yourself", 400));
    }
    const existingRequest = await LocalRequestModel.findOne({
        senderId,
        receiverId,
        type,
        status: "pending",
    });
    if (existingRequest) {
        return next(new ErrorResponse_1.default("A pending request already exists", 400));
    }
    const request = await LocalRequestModel.create({
        senderId,
        receiverId,
        type,
        message,
        documentId: type === "DocumentAccess" ? documentId : undefined,
    });
    await (0, Notification_1.createNotificationUtil)({
        sender: senderId,
        recipient: receiverId,
        message: `${req.session.user?.name} sent you a connection request`,
        type: "CONNECTION_REQUEST",
        link: request._id,
    }, LocalDb_1.getLocalNotificationModel);
    res.status(201).json({
        success: true,
        message: "Request sent successfully",
        data: request,
    });
});
exports.getAllUserRequests = (0, express_async_handler_1.default)(async (req, res, next) => {
    const LocalRequestModel = (0, LocalDb_1.getLocalRequestModel)();
    const userId = req.session.user?._id;
    if (!userId) {
        return next(new ErrorResponse_1.default("Not authorized", 401));
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
});
exports.updateRequestStatus = (0, express_async_handler_1.default)(async (req, res, next) => {
    const LocalRequestModel = (0, LocalDb_1.getLocalRequestModel)();
    const LocalEntrepreneurModel = (0, LocalDb_1.getLocalEntrepreneurModel)();
    const LocalConversationModel = (0, LocalDb_1.getLocalConversationModel)();
    const { requestId, status } = req.body;
    const userId = req.session.user?._id;
    if (!userId) {
        return next(new ErrorResponse_1.default("Not authorized", 401));
    }
    const request = await LocalRequestModel.findById(requestId);
    if (!request) {
        return next(new ErrorResponse_1.default("Request not found", 404));
    }
    if (request.receiverId.toString() !== userId) {
        return next(new ErrorResponse_1.default("You are not authorized to update this request", 403));
    }
    request.status = status;
    await request.save();
    let entrepreneur;
    if (status === "accepted") {
        entrepreneur = (await LocalEntrepreneurModel.findOneAndUpdate({ user: userId }, { $addToSet: { connections: request.senderId } }));
        await LocalConversationModel.create({
            participants: [request.receiverId, request.senderId],
        });
        await (0, Notification_1.createNotificationUtil)({
            sender: req.session.user?._id,
            recipient: request.senderId,
            message: `${entrepreneur.startupName} accepted your connection request`,
            type: "REQUEST_ACCEPTED",
            link: request._id,
        }, LocalDb_1.getLocalNotificationModel);
    }
    res.status(200).json({
        success: true,
        message: `Request ${status} successfully`,
        data: request,
    });
});
