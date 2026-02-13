"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntrepreneurSchema = void 0;
const mongoose_1 = require("mongoose");
exports.EntrepreneurSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
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
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Documents",
        },
    ],
    connections: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
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
}, { timestamps: true });
