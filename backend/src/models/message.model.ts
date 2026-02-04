import mongoose, { Document, Schema } from "mongoose";

export interface IMessage extends Document {
    senderId: mongoose.Types.ObjectId;
    receiverId: mongoose.Types.ObjectId;
    conversationId: mongoose.Types.ObjectId;
    content: string;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export const messageSchema = new Schema<IMessage>(
    {
        senderId: {
            type: Schema.Types.ObjectId,
            ref: "Users",
            required: true,
        },
        receiverId: {
            type: Schema.Types.ObjectId,
            ref: "Users",
            required: true,
        },
        conversationId: {
            type: Schema.Types.ObjectId,
            ref: "Conversations",
            required: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
        },
        isRead: { type: Boolean, default: false },
    },
    { timestamps: true },
);
