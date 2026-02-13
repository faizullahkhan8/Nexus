import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import {
    getLocalDealModel,
    getLocalMeetingModel,
    getLocalNotificationModel,
} from "../db/LocalDb";
import ErrorResponse from "../utils/ErrorResponse";
import { createNotificationUtil } from "../utils/Notification";
import { MeetingStatus } from "../models/Meeting.model";

const MEETING_STATUSES: MeetingStatus[] = [
    "scheduled",
    "completed",
    "cancelled",
];

const isMeetingParticipant = (meeting: any, userId: string) => {
    return (
        meeting.scheduledBy?.toString() === userId ||
        meeting.attendeeId?.toString() === userId
    );
};

const getMeetingCounterPartyId = (meeting: any, userId: string) => {
    if (meeting.scheduledBy?.toString() === userId) {
        return meeting.attendeeId?.toString();
    }
    return meeting.scheduledBy?.toString();
};

export const scheduleMeeting = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const LocalMeetingModel = getLocalMeetingModel();
        const LocalDealModel = getLocalDealModel();

        if (!LocalMeetingModel) {
            return next(new ErrorResponse("Meeting model unavailable", 500));
        }

        const userId = req.session.user?._id;
        const {
            attendeeId,
            title,
            agenda,
            startTime,
            durationMinutes,
            meetingType,
            meetingLink,
            location,
            relatedDealId,
        } = req.body;

        if (!userId) {
            return next(new ErrorResponse("Not authorized", 401));
        }

        if (!attendeeId || !title?.trim() || !startTime) {
            return next(
                new ErrorResponse(
                    "Attendee, title, and start time are required",
                    400,
                ),
            );
        }

        if (attendeeId === userId) {
            return next(new ErrorResponse("Invalid attendee", 400));
        }

        const meetingStart = new Date(startTime);
        if (Number.isNaN(meetingStart.getTime())) {
            return next(new ErrorResponse("Invalid start time", 400));
        }

        if (relatedDealId) {
            if (!LocalDealModel) {
                return next(new ErrorResponse("Deal model unavailable", 500));
            }

            const relatedDeal = await LocalDealModel.findById(relatedDealId);
            if (!relatedDeal) {
                return next(new ErrorResponse("Related deal not found", 404));
            }

            const isUserInDeal =
                relatedDeal.investorId.toString() === userId ||
                relatedDeal.startupId.toString() === userId;
            const isAttendeeInDeal =
                relatedDeal.investorId.toString() === attendeeId ||
                relatedDeal.startupId.toString() === attendeeId;

            if (!isUserInDeal || !isAttendeeInDeal) {
                return next(
                    new ErrorResponse(
                        "Related deal participants do not match attendees",
                        403,
                    ),
                );
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

        await createNotificationUtil(
            {
                sender: userId,
                recipient: attendeeId,
                message: `${req.session.user?.name} scheduled a meeting: ${meeting.title}`,
                type: "MEETING_SCHEDULED",
                link: meeting._id,
            },
            getLocalNotificationModel,
        );

        res.status(201).json({
            success: true,
            message: "Meeting scheduled successfully",
            data: populatedMeeting,
        });
    },
);

export const getMyMeetings = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const LocalMeetingModel = getLocalMeetingModel();

        if (!LocalMeetingModel) {
            return next(new ErrorResponse("Meeting model unavailable", 500));
        }

        const userId = req.session.user?._id;
        const { status } = req.query;

        if (!userId) {
            return next(new ErrorResponse("Not authorized", 401));
        }

        const query: any = {
            $or: [{ scheduledBy: userId }, { attendeeId: userId }],
        };

        if (
            typeof status === "string" &&
            MEETING_STATUSES.includes(status as MeetingStatus)
        ) {
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
    },
);

export const updateMeetingStatus = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const LocalMeetingModel = getLocalMeetingModel();

        if (!LocalMeetingModel) {
            return next(new ErrorResponse("Meeting model unavailable", 500));
        }

        const userId = req.session.user?._id;
        const { meetingId, status } = req.body;

        if (!userId) {
            return next(new ErrorResponse("Not authorized", 401));
        }

        if (!MEETING_STATUSES.includes(status)) {
            return next(new ErrorResponse("Invalid meeting status", 400));
        }

        const meeting = await LocalMeetingModel.findById(meetingId);

        if (!meeting) {
            return next(new ErrorResponse("Meeting not found", 404));
        }

        if (!isMeetingParticipant(meeting, userId)) {
            return next(
                new ErrorResponse("Not authorized to update meeting", 403),
            );
        }

        meeting.status = status;
        await meeting.save();

        const updatedMeeting = await LocalMeetingModel.findById(meeting._id)
            .populate("scheduledBy", "_id name email avatarUrl role isOnline")
            .populate("attendeeId", "_id name email avatarUrl role isOnline")
            .populate("relatedDealId");

        const recipientId = getMeetingCounterPartyId(meeting, userId);
        if (recipientId) {
            await createNotificationUtil(
                {
                    sender: userId,
                    recipient: recipientId,
                    message: `${req.session.user?.name} marked meeting as ${status}`,
                    type: "MEETING_SCHEDULED",
                    link: meeting._id,
                },
                getLocalNotificationModel,
            );
        }

        res.status(200).json({
            success: true,
            message: "Meeting status updated successfully",
            data: updatedMeeting,
        });
    },
);

export const rescheduleMeeting = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const LocalMeetingModel = getLocalMeetingModel();

        if (!LocalMeetingModel) {
            return next(new ErrorResponse("Meeting model unavailable", 500));
        }

        const userId = req.session.user?._id;
        const { meetingId, startTime, durationMinutes, meetingLink, location } =
            req.body;

        if (!userId) {
            return next(new ErrorResponse("Not authorized", 401));
        }

        const meeting = await LocalMeetingModel.findById(meetingId);

        if (!meeting) {
            return next(new ErrorResponse("Meeting not found", 404));
        }

        if (!isMeetingParticipant(meeting, userId)) {
            return next(
                new ErrorResponse("Not authorized to update meeting", 403),
            );
        }

        if (startTime !== undefined) {
            const parsedStartTime = new Date(startTime);
            if (Number.isNaN(parsedStartTime.getTime())) {
                return next(new ErrorResponse("Invalid start time", 400));
            }
            meeting.startTime = parsedStartTime;
        }

        if (durationMinutes !== undefined) {
            const parsedDuration = Number(durationMinutes);
            if (Number.isNaN(parsedDuration) || parsedDuration < 15) {
                return next(
                    new ErrorResponse(
                        "Duration must be at least 15 minutes",
                        400,
                    ),
                );
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
            await createNotificationUtil(
                {
                    sender: userId,
                    recipient: recipientId,
                    message: `${req.session.user?.name} rescheduled meeting: ${meeting.title}`,
                    type: "MEETING_SCHEDULED",
                    link: meeting._id,
                },
                getLocalNotificationModel,
            );
        }

        res.status(200).json({
            success: true,
            message: "Meeting rescheduled successfully",
            data: updatedMeeting,
        });
    },
);
