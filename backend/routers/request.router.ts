import { Router } from "express";
import {
    createRequest,
    getAllUserRequests,
    updateRequestStatus,
} from "../controllers/request.controller";
import { protect } from "../middlewares/Auth";

const router = Router();

router.post("/create", protect, createRequest);
router.get("/user-requests", protect, getAllUserRequests);
router.put("/update", protect, updateRequestStatus);

export default router;
