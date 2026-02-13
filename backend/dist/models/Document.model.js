"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentSchema = void 0;
const mongoose_1 = require("mongoose");
exports.DocumentSchema = new mongoose_1.Schema({
    originalName: { type: String, required: true, trim: true },
    fileName: { type: String, required: true },
    format: { type: String, enum: ["pdf", "doc", "docx"], required: true },
    mimeType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    // Cloudinary info
    cloudinaryUrl: { type: String, required: true },
    cloudinaryPublicId: { type: String, required: true },
    uploadedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    visibility: {
        type: String,
        enum: ["private", "public"],
        default: "private",
    },
}, { timestamps: true });
