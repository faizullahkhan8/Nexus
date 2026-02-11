import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import ErrorResponse from "../utils/ErrorResponse";
import { getLocalDocumentModel } from "../db/LocalDb";
import cloudinary from "../config/cloudinary.config";

export const uploadDocument = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const DocumentModel = getLocalDocumentModel();

        if (!DocumentModel)
            return next(new ErrorResponse("Document model not found", 500));

        const userId = req.session.user?._id;

        if (!userId) {
            return next(new ErrorResponse("Not authorized", 401));
        }

        if (!req.file) {
            return next(new ErrorResponse("No file uploaded", 400));
        }

        const { originalName } = req.body;
        if (!originalName) {
            return next(new ErrorResponse("Original name is required", 400));
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
            resource_type: "auto",
            folder: "documents",
            unique_filename: true,
        });

        if (!result) {
            return next(new ErrorResponse("Error uploading file", 500));
        }

        const mimeType = req.file.mimetype;
        const format = originalName.split(".").pop();

        const document = await DocumentModel.create({
            uploadedBy: req.session.user?._id,
            originalName: originalName,
            fileName: result.original_filename,
            mimeType: mimeType,
            format: format,
            fileSize: result.bytes,
            cloudinaryUrl: result.secure_url,
            cloudinaryPublicId: result.public_id,
            visibility: req.body.visibility || "private",
        });

        res.status(201).json({
            success: true,
            message: "Document uploaded successfully",
            data: document,
        });
    },
);

export const getDocuments = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const DocumentModel = getLocalDocumentModel();

        if (!DocumentModel) {
            return next(new ErrorResponse("Document model not found", 500));
        }

        const userId = req.session.user?._id;

        if (!userId) {
            return next(new ErrorResponse("Not authorized", 401));
        }

        const documents = await DocumentModel.find({ uploadedBy: userId });

        res.status(200).json({
            success: true,
            message: "Documents fetched successfully",
            documents,
        });
    },
);

export const deleteDocument = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const DocumentModel = getLocalDocumentModel();

        if (!DocumentModel) {
            return next(new ErrorResponse("Document model not found", 500));
        }
        const { id } = req.params;
        const userId = req.session.user?._id;

        if (!userId) {
            return next(new ErrorResponse("Not authorized", 401));
        }

        const document = await DocumentModel.findOne({
            _id: id,
            uploadedBy: userId,
        });

        if (!document) {
            return next(
                new ErrorResponse("Document not found or unauthorized", 404),
            );
        }

        if (document.cloudinaryPublicId) {
            const result = await cloudinary.uploader.destroy(
                document.cloudinaryPublicId,
                {
                    resource_type: "raw",
                    invalidate: true,
                },
            );
            if (result.result !== "ok") {
                console.log(document.cloudinaryPublicId);
                return next(new ErrorResponse("Error deleting file", 500));
            }
        }

        const result = await DocumentModel.findByIdAndDelete(id);

        if (!result) {
            return next(new ErrorResponse("Error deleting document", 500));
        }

        res.status(200).json({
            success: true,
            message: "Document deleted successfully",
        });
    },
);
