"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rescheduleMeeting = exports.updateMeetingStatus = exports.getMyMeetings = exports.scheduleMeeting = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const LocalDb_1 = require("../db/LocalDb");
const ErrorResponse_1 = __importDefault(require("../utils/ErrorResponse"));
const Notification_1 = require("../utils/Notification");
const MEETING_STATUSES = [
    "scheduled",
    "completed",
    "cancelled",
];
const isMeetingParticipant = (meeting, userId) => {
    return (meeting.scheduledBy?.toString() === userId ||
        meeting.attendeeId?.toString() === userId);
};
const getMeetingCounterPartyId = (meeting, userId) => {
    if (meeting.scheduledBy?.toString() === userId) {
        return meeting.attendeeId?.toString();
    }
    return meeting.scheduledBy?.toString();
};
exports.scheduleMeeting = (0, express_async_handler_1.default)(async (req, res, next) => {
    const LocalMeetingModel = (0, LocalDb_1.getLocalMeetingModel)();
    const LocalDealModel = (0, LocalDb_1.getLocalDealModel)();
    if (!LocalMeetingModel) {
        return next(new ErrorResponse_1.default("Meeting model unavailable", 500));
    }
    const userId = req.session.user?._id;
    const { attendeeId, title, agenda, startTime, durationMinutes, meetingType, meetingLink, location, relatedDealId, } = req.body;
    if (!userId) {
        return next(new ErrorResponse_1.default("Not authorized", 401));
    }
    if (!attendeeId || !title?.trim() || !startTime) {
        return next(new ErrorResponse_1.default("Attendee, title, and start time are required", 400));
    }
    if (attendeeId === userId) {
        return next(new ErrorResponse_1.default("Invalid attendee", 400));
    }
    const meetingStart = new Date(startTime);
    if (Number.isNaN(meetingStart.getTime())) {
        return next(new ErrorResponse_1.default("Invalid start time", 400));
    }
    if (relatedDealId) {
        if (!LocalDealModel) {
            return next(new ErrorResponse_1.default("Deal model unavailable", 500));
        }
        const relatedDeal = await LocalDealModel.findById(relatedDealId);
        if (!relatedDeal) {
            return next(new ErrorResponse_1.default("Related deal not found", 404));
        }
        const isUserInDeal = relatedDeal.investorId.toString() === userId ||
            relatedDeal.startupId.toString() === userId;
        const isAttendeeInDeal = relatedDeal.investorId.toString() === attendeeId ||
            relatedDeal.startupId.toString() === attendeeId;
        if (!isUserInDeal || !isAttendeeInDeal) {
            return next(new ErrorResponse_1.default("Related deal participants do not match attendees", 403));
        }
    }
    const meeting = await LocalMeetingModel.create({
        title: title.trim(),
        agenda,
        scheduledBy: userId,
        attendeeId,
        startTime: meetingStart,
        durationMinutes: Number(durationMinutes) || 30,
        meetingType,
        meetingLink,
        location,
        relatedDealId: relatedDealId || undefined,
    });
    const populatedMeeting = await LocalMeetingModel.findById(meeting._id)
        .populate("scheduledBy", "_id name email avatarUrl role isOnline")
        .populate("attendeeId", "_id name email avatarUrl role isOnline")
        .populate("relatedDealId");
    await (0, Notification_1.createNotificationUtil)({
        sender: userId,
        recipient: attendeeId,
        message: `${req.session.user?.name} scheduled a meeting: ${meeting.title}`,
        type: "MEETING_SCHEDULED",
        link: meeting._id,
    }, LocalDb_1.getLocalNotificationModel);
    res.status(201).json({
        success: true,
        message: "Meeting scheduled successfully",
        data: populatedMeeting,
    });
});
exports.getMyMeetings = (0, express_async_handler_1.default)(async (req, res, next) => {
    const LocalMeetingModel = (0, LocalDb_1.getLocalMeetingModel)();
    if (!LocalMeetingModel) {
        return next(new ErrorResponse_1.default("Meeting model unavailable", 500));
    }
    const userId = req.session.user?._id;
    const { status } = req.query;
    if (!userId) {
        return next(new ErrorResponse_1.default("Not authorized", 401));
    }
    const query = {
        $or: [{ scheduledBy: userId }, { attendeeId: userId }],
    };
    if (typeof status === "string" &&
        MEETING_STATUSES.includes(status)) {
        query.status = status;
    }
    const meetings = await LocalMeetingModel.find(query)
        .populate("scheduledBy", "_id name email avatarUrl role isOnline")
        .populate("attendeeId", "_id name email avatarUrl role isOnline")
        .populate("relatedDealId")
        .sort({ startTime: 1 });
    res.status(200).json({
        success: true,
        count: meetings.length,
        meetings,
    });
});
exports.updateMeetingStatus = (0, express_async_handler_1.default)(async (req, res, next) => {
    const LocalMeetingModel = (0, LocalDb_1.getLocalMeetingModel)();
    if (!LocalMeetingModel) {
        return next(new ErrorResponse_1.default("Meeting model unavailable", 500));
    }
    const userId = req.session.user?._id;
    const { meetingId, status } = req.body;
    if (!userId) {
        return next(new ErrorResponse_1.default("Not authorized", 401));
    }
    if (!MEETING_STATUSES.includes(status)) {
        return next(new ErrorResponse_1.default("Invalid meeting status", 400));
    }
    const meeting = await LocalMeetingModel.findById(meetingId);
    if (!meeting) {
        return next(new ErrorResponse_1.default("Meeting not found", 404));
    }
    if (!isMeetingParticipant(meeting, userId)) {
        return next(new ErrorResponse_1.default("Not authorized to update meeting", 403));
    }
    meeting.status = status;
    await meeting.save();
    const updatedMeeting = await LocalMeetingModel.findById(meeting._id)
        .populate("scheduledBy", "_id name email avatarUrl role isOnline")
        .populate("attendeeId", "_id name email avatarUrl role isOnline")
        .populate("relatedDealId");
    const recipientId = getMeetingCounterPartyId(meeting, userId);
    if (recipientId) {
        await (0, Notification_1.createNotificationUtil)({
            sender: userId,
            recipient: recipientId,
            message: `${req.session.user?.name} marked meeting as ${status}`,
            type: "MEETING_SCHEDULED",
            link: meeting._id,
        }, LocalDb_1.getLocalNotificationModel);
    }
    res.status(200).json({
        success: true,
        message: "Meeting status updated successfully",
        data: updatedMeeting,
    });
});
exports.rescheduleMeeting = (0, express_async_handler_1.default)(async (req, res, next) => {
    const LocalMeetingModel = (0, LocalDb_1.getLocalMeetingModel)();
    if (!LocalMeetingModel) {
        return next(new ErrorResponse_1.default("Meeting model unavailable", 500));
    }
    const userId = req.session.user?._id;
    const { meetingId, startTime, durationMinutes, meetingLink, location } = req.body;
    if (!userId) {
        return next(new ErrorResponse_1.default("Not authorized", 401));
    }
    const meeting = await LocalMeetingModel.findById(meetingId);
    if (!meeting) {
        return next(new ErrorResponse_1.default("Meeting not found", 404));
    }
    if (!isMeetingParticipant(meeting, userId)) {
        return next(new ErrorResponse_1.default("Not authorized to update meeting", 403));
    }
    if (startTime !== undefined) {
        const parsedStartTime = new Date(startTime);
        if (Number.isNaN(parsedStartTime.getTime())) {
            return next(new ErrorResponse_1.default("Invalid start time", 400));
        }
        meeting.startTime = parsedStartTime;
    }
    if (durationMinutes !== undefined) {
        const parsedDuration = Number(durationMinutes);
        if (Number.isNaN(parsedDuration) || parsedDuration < 15) {
            return next(new ErrorResponse_1.default("Duration must be at least 15 minutes", 400));
        }
        meeting.durationMinutes = parsedDuration;
    }
    if (meetingLink !== undefined) {
        meeting.meetingLink = meetingLink;
    }
    if (location !== undefined) {
        meeting.location = location;
    }
    meeting.status = "scheduled";
    await meeting.save();
    const updatedMeeting = await LocalMeetingModel.findById(meeting._id)
        .populate("scheduledBy", "_id name email avatarUrl role isOnline")
        .populate("attendeeId", "_id name email avatarUrl role isOnline")
        .populate("relatedDealId");
    const recipientId = getMeetingCounterPartyId(meeting, userId);
    if (recipientId) {
        await (0, Notification_1.createNotificationUtil)({
            sender: userId,
            recipient: recipientId,
            message: `${req.session.user?.name} rescheduled meeting: ${meeting.title}`,
            type: "MEETING_SCHEDULED",
            link: meeting._id,
        }, LocalDb_1.getLocalNotificationModel);
    }
    res.status(200).json({
        success: true,
        message: "Meeting rescheduled successfully",
        data: updatedMeeting,
    });
});
