import mongoose, { Document, Schema } from "mongoose";

export type PaymentStatus = "pending" | "succeeded" | "failed" | "canceled";
export type PaymentType = "one_time" | "subscription";

export interface IPayment extends Document {
    userId: mongoose.Types.ObjectId;
    amount: number;
    currency: string;
    stripeSessionId?: string;
    stripePaymentIntentId?: string;
    status: PaymentStatus;
    type: PaymentType;
    description?: string;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

export interface IDealPayment extends IPayment {
    dealId: mongoose.Types.ObjectId;
    paidBy: mongoose.Types.ObjectId;
    receivedBy: mongoose.Types.ObjectId;
}

export const paymentSchema = new Schema<IPayment>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "Users",
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        currency: {
            type: String,
            default: "usd",
        },
        stripeSessionId: {
            type: String,
            trim: true,
        },
        stripePaymentIntentId: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ["pending", "succeeded", "failed", "canceled"],
            default: "pending",
        },
        type: {
            type: String,
            enum: ["one_time", "subscription"],
            default: "one_time",
        },
        description: {
            type: String,
            trim: true,
        },
        metadata: {
            type: Schema.Types.Mixed,
            default: {},
        },
    },
    { timestamps: true },
);

export const dealPaymentSchema = new Schema<IDealPayment>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "Users",
            required: true,
        },
        dealId: {
            type: Schema.Types.ObjectId,
            ref: "Deals",
            required: true,
        },
        paidBy: {
            type: Schema.Types.ObjectId,
            ref: "Users",
            required: true,
        },
        receivedBy: {
            type: Schema.Types.ObjectId,
            ref: "Users",
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        currency: {
            type: String,
            default: "usd",
        },
        stripeSessionId: {
            type: String,
            trim: true,
        },
        stripePaymentIntentId: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ["pending", "succeeded", "failed", "canceled"],
            default: "pending",
        },
        type: {
            type: String,
            enum: ["one_time", "subscription"],
            default: "one_time",
        },
        description: {
            type: String,
            trim: true,
        },
        metadata: {
            type: Schema.Types.Mixed,
            default: {},
        },
    },
    { timestamps: true },
);

export default mongoose.model<IPayment>("Payments", paymentSchema);
