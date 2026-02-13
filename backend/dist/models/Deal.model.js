"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dealSchema = void 0;
const mongoose_1 = require("mongoose");
exports.dealSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    investorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
    },
    startupId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
    },
}, { timestamps: true });
