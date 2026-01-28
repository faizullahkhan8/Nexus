import { Document, Schema, Types } from "mongoose";

export interface IInvestor extends Document {
    user: Types.ObjectId;
    investmentInterests: string[];
    investmentStages: string[];
    portfolioCompanies: string[];
    investmentRange: {
        minAmount: number;
        maxAmount: number;
    };
    totalInvestments: number;
    investmentCriteria: string[];
    location: string;
    profileViews: number;
}

export const InvestorSchema = new Schema<IInvestor>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "Users",
        required: true,
    },
    investmentInterests: [
        {
            type: String,
            required: true,
        },
    ],
    investmentStages: [
        {
            type: String,
            required: true,
        },
    ],
    portfolioCompanies: [
        {
            type: String,
        },
    ],
    investmentRange: {
        minAmount: {
            type: Number,
            required: true,
            default: 0,
        },
        maxAmount: {
            type: Number,
            required: true,
            default: 0,
        },
    },
    totalInvestments: {
        type: Number,
        default: 0,
    },
    investmentCriteria: [
        {
            type: String,
        },
    ],
    location: {
        type: String,
        required: true,
    },
    profileViews: {
        type: Number,
        default: 0,
    },
});
