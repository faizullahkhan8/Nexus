"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Auth_1 = require("../middlewares/Auth");
const payment_controller_1 = require("../controllers/payment.controller");
const router = (0, express_1.Router)();
router.post("/create-deal-payment", Auth_1.protect, payment_controller_1.createDealPayment);
router.get("/successful-payments", Auth_1.protect, payment_controller_1.getSuccessfulDealPayments);
router.get("/deal-payments/:dealId", Auth_1.protect, payment_controller_1.getPaymentsByDeal);
router.get("/verify-payment", payment_controller_1.verifyPaymentSession);
router.post("/webhook", expressRawBodyMiddleware, payment_controller_1.stripeWebhookHandler);
exports.default = router;
function expressRawBodyMiddleware(req, _res, next) {
    try {
        // attach raw string for use in webhook handler
        req.rawBody = JSON.stringify(req.body);
    }
    catch (e) {
        req.rawBody = "";
    }
    next();
}
