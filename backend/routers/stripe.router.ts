import { Request, Response, Router } from "express";
import { protect } from "../middlewares/Auth";
import {
    stripeWebhookHandler,
    createDealPayment,
    getSuccessfulDealPayments,
    getPaymentsByDeal,
    verifyPaymentSession,
} from "../controllers/payment.controller";

const router = Router();

router.post("/create-deal-payment", protect, createDealPayment);
router.get("/successful-payments", protect, getSuccessfulDealPayments);
router.get("/deal-payments/:dealId", protect, getPaymentsByDeal);
router.get("/verify-payment", verifyPaymentSession);

router.post("/webhook", expressRawBodyMiddleware, stripeWebhookHandler as any);

export default router;

function expressRawBodyMiddleware(req: Request, _res: Response, next: any) {
    try {
        // attach raw string for use in webhook handler
        (req as any).rawBody = JSON.stringify(req.body);
    } catch (e) {
        (req as any).rawBody = "";
    }
    next();
}
