import { Router } from "express";
import {
    createMessage,
    deleteMessage,
    getMessageById,
    getMessagesBetweenUsers,
    markMessageRead,
} from "../controllers/message.controller";
import { protect } from "../middlewares/Auth";

const router = Router();

router.post("/create", protect, createMessage);
router.get("/between/:userId", protect, getMessagesBetweenUsers);
router.get("/:messageId", protect, getMessageById);
router.put("/read/:messageId", protect, markMessageRead);
router.delete("/:messageId", protect, deleteMessage);

export default router;
