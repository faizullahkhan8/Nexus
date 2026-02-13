"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageSchema = void 0;
const mongoose_1 = require("mongoose");
exports.messageSchema = new mongoose_1.Schema({
    senderId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
    },
    receiverId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
    },
    conversationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Conversations",
        required: true,
    },
    content: {
        type: String,
        required: true,
        trim: true,
    },
    isRead: { type: Boolean, default: false },
}, { timestamps: true });
