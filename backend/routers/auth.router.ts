import express from "express";
import {
    signup,
    login,
    changePassword,
    toggleTwoFactor,
    logout,
    updateEntrepreneurProfile,
    updateInvestorProfile,
    getAllEntrepreneurs,
    getAllInvestors,
    getMe,
    getSingleEntrepreneur,
    getSingleInvestor,
} from "../controllers/auth.controller";
import { protect } from "../middlewares/Auth";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/get-me", protect, getMe);
router.put("/change-password", protect, changePassword);
router.put("/toggle-two-factor", protect, toggleTwoFactor);
router.post("/logout", protect, logout);

// entrepreneur routes
router.put("/entrepreneur/profile/update", protect, updateEntrepreneurProfile);
router.get("/entrepreneur/get-all", protect, getAllEntrepreneurs);
router.get("/entrepreneur/get/:id", protect, getSingleEntrepreneur);

// investor routes
router.put("/investor/profile/update", protect, updateInvestorProfile);
router.get("/investor/get-all", protect, getAllInvestors);
router.get("/investor/get/:id", protect, getSingleInvestor);

export default router;
