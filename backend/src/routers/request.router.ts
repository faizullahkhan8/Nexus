import { Router } from "express";
import {
    createRequest,
    getAllUserRequests,
} from "../controllers/request.controller";
import { protect } from "../middlewares/Auth";

const router = Router();

router.post("/create", protect, createRequest);
router.get("/user-requests", protect, getAllUserRequests);

export default router;
