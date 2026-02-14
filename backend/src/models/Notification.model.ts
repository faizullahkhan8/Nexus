import mongoose, { Document, Types } from "mongoose";

export interface INotification extends Document {
    recipient: Types.ObjectId | string;
    sender?: Types.ObjectId | string;
    type:
        | "CONNECTION_REQUEST"
        | "REQUEST_ACCEPTED"
        | "NEW_MESSAGE"
        | "DOCUMENT_SHARED"
        | "MEETING_SCHEDULED"
        | "INVESTMENT_RECEIVED"
        | "PAYMENT_RECEIVED";
    message: string;
    link?: Types.ObjectId | string;
    isRead: boolean;
}

export const notificationSchema = new mongoose.Schema<INotification>(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
            required: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
        },
        type: {
            type: String,
            enum: [
                "CONNECTION_REQUEST",
                "REQUEST_ACCEPTED",
                "NEW_MESSAGE",
                "DOCUMENT_SHARED",
                "MEETING_SCHEDULED",
                "INVESTMENT_RECEIVED",
                "DEAL_CREATED",
                "DEAL_UPDATED",
                "PAYMENT_RECEIVED",
            ],
            required: true,
        },
        message: { type: String, required: true },
        link: { type: String },
        isRead: { type: Boolean, default: false },
    },
    { timestamps: true },
);
