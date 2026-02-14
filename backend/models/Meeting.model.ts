import mongoose, { Document, Schema } from "mongoose";

export type MeetingStatus = "scheduled" | "completed" | "cancelled";
export type MeetingType = "video" | "audio" | "in_person";

export interface IMeeting extends Document {
    title: string;
    agenda?: string;
    scheduledBy: mongoose.Types.ObjectId;
    attendeeId: mongoose.Types.ObjectId;
    startTime: Date;
    durationMinutes: number;
    status: MeetingStatus;
    meetingType: MeetingType;
    meetingLink?: string;
    location?: string;
    relatedDealId?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export const meetingSchema = new Schema<IMeeting>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        agenda: {
            type: String,
            trim: true,
            default: "",
        },
        scheduledBy: {
            type: Schema.Types.ObjectId,
            ref: "Users",
            required: true,
        },
        attendeeId: {
            type: Schema.Types.ObjectId,
            ref: "Users",
            required: true,
        },
        startTime: {
            type: Date,
            required: true,
        },
        durationMinutes: {
            type: Number,
            default: 30,
            min: 15,
        },
        status: {
            type: String,
            enum: ["scheduled", "completed", "cancelled"],
            default: "scheduled",
        },
        meetingType: {
            type: String,
            enum: ["video", "audio", "in_person"],
            default: "video",
        },
        meetingLink: {
            type: String,
            trim: true,
        },
        location: {
            type: String,
            trim: true,
        },
        relatedDealId: {
            type: Schema.Types.ObjectId,
            ref: "Deals",
        },
    },
    { timestamps: true },
);
