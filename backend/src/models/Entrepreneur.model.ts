import { Document, Schema, Types } from "mongoose";

export interface ITeamMember {
    name: string;
    avatarUrl?: string;
    role: string;
}

export interface IStartupOverview {
    heading: string;
    paragraph: string;
}

export interface IfundingRound {
    round: number;
    amount: number;
    isCurrent: boolean;
    date: Date;
}

export interface IEntrepreneur extends Document {
    user: Types.ObjectId;
    startupName: string;
    bio: string;
    industry: string;
    pitchSummary: string;
    fundingRound: IfundingRound[];
    location: string;
    foundedYear: number;
    startupOverview: IStartupOverview[];
    team: ITeamMember[];
    sharedWithMeDocs: Types.ObjectId[];
    connections: Types.ObjectId[];
    profileViews: number;
    valuation: {
        min: number;
        max: number;
    };
}

export const EntrepreneurSchema = new Schema<IEntrepreneur>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "Users",
            required: true,
        },
        startupName: {
            type: String,
            required: true,
            trim: true,
        },
        industry: {
            type: String,
            required: true,
        },
        pitchSummary: {
            type: String,
            required: true,
        },
        fundingRound: [
            {
                round: { type: Number, required: true },
                amount: { type: Number, required: true },
                isCurrent: { type: Boolean, default: false },
                date: { type: Date, required: true },
            },
        ],
        valuation: {
            min: { type: Number, required: false },
            max: { type: Number, required: false },
        },
        location: {
            type: String,
            required: true,
        },
        foundedYear: {
            type: Number,
            required: true,
        },
        startupOverview: [
            {
                heading: { type: String, required: true },
                paragraph: { type: String, required: true },
            },
        ],
        team: [
            {
                name: { type: String, required: true },
                avatarUrl: { type: String },
                role: { type: String, required: true },
            },
        ],
        sharedWithMeDocs: [
            {
                type: Schema.Types.ObjectId,
                ref: "Documents",
            },
        ],
        connections: [
            {
                type: Schema.Types.ObjectId,
                ref: "Users",
            },
        ],
        profileViews: {
            type: Number,
            default: 0,
        },
        bio: {
            type: String,
        },
    },
    { timestamps: true },
);
