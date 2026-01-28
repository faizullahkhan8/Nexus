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

export interface IEntrepreneur extends Document {
    user: Types.ObjectId;
    startupName: string;
    industry: string;
    pitchSummary: string;
    fundingNeeded: number;
    location: string;
    foundedYear: number;
    startupOverview: IStartupOverview[];
    team: ITeamMember[];
    sharedWithMeDocs: Types.ObjectId[];
    connections: Types.ObjectId[];
    profileViews: number;
}

export const EntrepreneurSchema = new Schema<IEntrepreneur>({
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
    fundingNeeded: {
        type: Number,
        default: 0,
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
});
