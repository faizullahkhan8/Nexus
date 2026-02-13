"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.meetingSchema = void 0;
const mongoose_1 = require("mongoose");
exports.meetingSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    agenda: {
        type: String,
        trim: true,
        default: "",
    },
    scheduledBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
    },
    attendeeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
    },
    startTime: {
        type: Date,
        required: true,
    },
    durationMinutes: {
        type: Number,
        default: 30,
        min: 15,
    },
    status: {
        type: String,
        enum: ["scheduled", "completed", "cancelled"],
        default: "scheduled",
    },
    meetingType: {
        type: String,
        enum: ["video", "audio", "in_person"],
        default: "video",
    },
    meetingLink: {
        type: String,
        trim: true,
    },
    location: {
        type: String,
        trim: true,
    },
    relatedDealId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Deals",
    },
}, { timestamps: true });
