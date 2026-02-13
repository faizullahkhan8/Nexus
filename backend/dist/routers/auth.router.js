"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const Auth_1 = require("../middlewares/Auth");
const router = express_1.default.Router();
router.post("/signup", auth_controller_1.signup);
router.post("/login", auth_controller_1.login);
router.get("/get-me", Auth_1.protect, auth_controller_1.getMe);
router.put("/change-password", Auth_1.protect, auth_controller_1.changePassword);
router.put("/toggle-two-factor", Auth_1.protect, auth_controller_1.toggleTwoFactor);
router.post("/logout", Auth_1.protect, auth_controller_1.logout);
// entrepreneur routes
router.put("/entrepreneur/profile/update", Auth_1.protect, auth_controller_1.updateEntrepreneurProfile);
router.get("/entrepreneur/get-all", Auth_1.protect, auth_controller_1.getAllEntrepreneurs);
router.get("/entrepreneur/get/:id", Auth_1.protect, auth_controller_1.getSingleEntrepreneur);
// investor routes
router.put("/investor/profile/update", Auth_1.protect, auth_controller_1.updateInvestorProfile);
router.get("/investor/get-all", Auth_1.protect, auth_controller_1.getAllInvestors);
router.get("/investor/get/:id", Auth_1.protect, auth_controller_1.getSingleInvestor);
exports.default = router;
