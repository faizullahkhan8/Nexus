"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.notificationSchema = new mongoose_1.default.Schema({
    recipient: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
    },
    sender: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Users",
    },
    type: {
        type: String,
        enum: [
            "CONNECTION_REQUEST",
            "REQUEST_ACCEPTED",
            "NEW_MESSAGE",
            "DOCUMENT_SHARED",
            "MEETING_SCHEDULED",
            "INVESTMENT_RECEIVED",
        ],
        required: true,
    },
    message: { type: String, required: true },
    link: { type: String },
    isRead: { type: Boolean, default: false },
}, { timestamps: true });
