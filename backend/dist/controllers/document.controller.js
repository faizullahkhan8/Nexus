"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDocument = exports.getDocuments = exports.uploadDocument = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const ErrorResponse_1 = __importDefault(require("../utils/ErrorResponse"));
const LocalDb_1 = require("../db/LocalDb");
const cloudinary_config_1 = __importDefault(require("../config/cloudinary.config"));
exports.uploadDocument = (0, express_async_handler_1.default)(async (req, res, next) => {
    const DocumentModel = (0, LocalDb_1.getLocalDocumentModel)();
    if (!DocumentModel)
        return next(new ErrorResponse_1.default("Document model not found", 500));
    const userId = req.session.user?._id;
    if (!userId) {
        return next(new ErrorResponse_1.default("Not authorized", 401));
    }
    if (!req.file) {
        return next(new ErrorResponse_1.default("No file uploaded", 400));
    }
    const { originalName } = req.body;
    if (!originalName) {
        return next(new ErrorResponse_1.default("Original name is required", 400));
    }
    const result = await cloudinary_config_1.default.uploader.upload(req.file.path, {
        resource_type: "auto",
        folder: "documents",
        unique_filename: true,
    });
    if (!result) {
        return next(new ErrorResponse_1.default("Error uploading file", 500));
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
});
exports.getDocuments = (0, express_async_handler_1.default)(async (req, res, next) => {
    const DocumentModel = (0, LocalDb_1.getLocalDocumentModel)();
    if (!DocumentModel) {
        return next(new ErrorResponse_1.default("Document model not found", 500));
    }
    const userId = req.session.user?._id;
    if (!userId) {
        return next(new ErrorResponse_1.default("Not authorized", 401));
    }
    const documents = await DocumentModel.find({ uploadedBy: userId });
    res.status(200).json({
        success: true,
        message: "Documents fetched successfully",
        documents,
    });
});
exports.deleteDocument = (0, express_async_handler_1.default)(async (req, res, next) => {
    const DocumentModel = (0, LocalDb_1.getLocalDocumentModel)();
    if (!DocumentModel) {
        return next(new ErrorResponse_1.default("Document model not found", 500));
    }
    const { id } = req.params;
    const userId = req.session.user?._id;
    if (!userId) {
        return next(new ErrorResponse_1.default("Not authorized", 401));
    }
    const document = await DocumentModel.findOne({
        _id: id,
        uploadedBy: userId,
    });
    if (!document) {
        return next(new ErrorResponse_1.default("Document not found or unauthorized", 404));
    }
    if (document.cloudinaryPublicId) {
        const result = await cloudinary_config_1.default.uploader.destroy(document.cloudinaryPublicId, {
            resource_type: "raw",
            invalidate: true,
        });
        if (result.result !== "ok") {
            console.log(document.cloudinaryPublicId);
            return next(new ErrorResponse_1.default("Error deleting file", 500));
        }
    }
    const result = await DocumentModel.findByIdAndDelete(id);
    if (!result) {
        return next(new ErrorResponse_1.default("Error deleting document", 500));
    }
    res.status(200).json({
        success: true,
        message: "Document deleted successfully",
    });
});
