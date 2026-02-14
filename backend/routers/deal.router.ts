import { Router } from "express";
import { protect } from "../middlewares/Auth";
import {
    createDeal,
    getMyDeals,
    updateDealDetails,
    updateDealStatus,
} from "../controllers/deal.controller";

const router = Router();

router.post("/create", protect, createDeal);
router.get("/my-deals", protect, getMyDeals);
router.put("/status", protect, updateDealStatus);
router.put("/update", protect, updateDealDetails);

export default router;
