"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.requestSchema = new mongoose_1.default.Schema({
    senderId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
    },
    receiverId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
    },
    type: {
        type: String,
        enum: ["Connection", "DocumentAccess", "Meeting"],
        required: true,
    },
    documentId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Document" },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending",
    },
    message: { type: String },
}, { timestamps: true });
