"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.conversationSchema = void 0;
const mongoose_1 = require("mongoose");
exports.conversationSchema = new mongoose_1.Schema({
    participants: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
}, { timestamps: true });
