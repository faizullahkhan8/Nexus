import mongoose from "mongoose";

export interface IRequest extends mongoose.Document {
    senderId: mongoose.Types.ObjectId;
    receiverId: mongoose.Types.ObjectId;
    type: "Connection" | "DocumentAccess" | "Meeting";
    documentId?: mongoose.Types.ObjectId;
    status: "pending" | "accepted" | "rejected";
    message?: string;
}

export const requestSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
            required: true,
        },

        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
            required: true,
        },

        type: {
            type: String,
            enum: ["Connection", "DocumentAccess", "Meeting"],
            required: true,
        },

        documentId: { type: mongoose.Schema.Types.ObjectId, ref: "Document" },

        status: {
            type: String,
            enum: ["pending", "accepted", "rejected"],
            default: "pending",
        },

        message: { type: String },
    },
    { timestamps: true },
);
