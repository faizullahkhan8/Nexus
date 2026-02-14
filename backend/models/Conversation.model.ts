import mongoose, { Schema, Document } from "mongoose";

export interface IConversation extends Document {
    participants: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

export const conversationSchema = new Schema<IConversation>(
    {
        participants: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    { timestamps: true },
);
