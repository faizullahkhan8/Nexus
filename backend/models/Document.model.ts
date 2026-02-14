import { Schema, model, Types, Document as MongooseDocument } from "mongoose";

export interface IDocument extends MongooseDocument {
    originalName: string;
    fileName: string;
    format: "pdf" | "doc" | "docx";
    mimeType: string;
    fileSize: number;
    cloudinaryUrl: string;
    cloudinaryPublicId: string;
    uploadedBy: Types.ObjectId;
    visibility: "private" | "public";
    createdAt: Date;
    updatedAt: Date;
}

export const DocumentSchema = new Schema<IDocument>(
    {
        originalName: { type: String, required: true, trim: true },
        fileName: { type: String, required: true },
        format: { type: String, enum: ["pdf", "doc", "docx"], required: true },
        mimeType: { type: String, required: true },
        fileSize: { type: Number, required: true },

        // Cloudinary info
        cloudinaryUrl: { type: String, required: true },
        cloudinaryPublicId: { type: String, required: true },

        uploadedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        visibility: {
            type: String,
            enum: ["private", "public"],
            default: "private",
        },
    },
    { timestamps: true },
);
