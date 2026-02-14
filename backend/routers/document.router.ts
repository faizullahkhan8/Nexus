import { Router } from "express";
import { uploadDocs } from "../middlewares/upload.middleware";
import {
    getDocuments,
    uploadDocument,
    deleteDocument,
} from "../controllers/document.controller";
import { protect } from "../middlewares/Auth";

const router = Router();

router.post("/upload", protect, uploadDocs.single("document"), uploadDocument);
router.get("/", protect, getDocuments);
router.delete("/:id", protect, deleteDocument);

export default router;
