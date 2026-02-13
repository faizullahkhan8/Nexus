"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvestorSchema = void 0;
const mongoose_1 = require("mongoose");
exports.InvestorSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
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
            _id: { type: mongoose_1.Schema.Types.ObjectId, ref: "Entrepreneurs" },
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
}, { timestamps: true });
