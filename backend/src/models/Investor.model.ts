import { Document, Schema, Types } from "mongoose";

export interface IPortfolioCompanies {
    name: string;
    date: string;
    amountInvested: number;
}

export interface IInvestmentInterests {
    interest: string;
    percentage: number;
}

export interface IInvestor extends Document {
    user: Types.ObjectId;
    investmentInterests: IInvestmentInterests[];
    investmentStages: string[];
    portfolioCompanies: IPortfolioCompanies[];
    bio: string;
    investmentRange: {
        minAmount: number;
        maxAmount: number;
    };
    totalInvestments: number;
    investmentCriteria: string[];
    location: string;
    profileViews: number;
}

export const InvestorSchema = new Schema<IInvestor>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "Users",
            required: true,
        },
        investmentInterests: [
            {
                interest: { type: String, required: true },
                percentage: { type: Number, required: true },
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
                name: { type: String, required: true },
                date: { type: String, required: true },
                amountInvested: { type: Number, required: true },
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
        bio: {
            type: String,
            required: true,
        },
    },
    { timestamps: true },
);
