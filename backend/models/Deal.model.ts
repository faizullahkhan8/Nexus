import mongoose, { Document, Schema } from "mongoose";

export type DealStatus =
    | "prospecting"
    | "due_diligence"
    | "term_sheet"
    | "negotiation"
    | "closed_won"
    | "closed_lost";

export type DealStage =
    | "Pre-seed"
    | "Seed"
    | "Series A"
    | "Series B"
    | "Series C"
    | "Growth";

export interface IDeal extends Document {
    title: string;
    investorId: mongoose.Types.ObjectId;
    startupId: mongoose.Types.ObjectId;
    amount: number;
    equity: number;
    stage: DealStage;
    status: DealStatus;
    notes?: string;
    expectedCloseDate?: Date;
    lastActivity: Date;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export const dealSchema = new Schema<IDeal>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        investorId: {
            type: Schema.Types.ObjectId,
            ref: "Users",
            required: true,
        },
        startupId: {
            type: Schema.Types.ObjectId,
            ref: "Users",
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        equity: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },
        stage: {
            type: String,
            enum: [
                "Pre-seed",
                "Seed",
                "Series A",
                "Series B",
                "Series C",
                "Growth",
            ],
            default: "Seed",
        },
        status: {
            type: String,
            enum: [
                "prospecting",
                "due_diligence",
                "term_sheet",
                "negotiation",
                "closed_won",
                "closed_lost",
            ],
            default: "prospecting",
        },
        notes: {
            type: String,
            default: "",
            trim: true,
        },
        expectedCloseDate: {
            type: Date,
        },
        lastActivity: {
            type: Date,
            default: Date.now,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "Users",
            required: true,
        },
    },
    { timestamps: true },
);
