import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import stripe from "../config/stripe.config";
import ErrorResponse from "../utils/ErrorResponse";
import {
    getLocalDealPaymentModel,
    getLocalNotificationModel,
    getLocalDealModel,
} from "../db/LocalDb";
import { createNotificationUtil } from "../utils/Notification";

export const createDealPayment = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const LocalDealPaymentModel = getLocalDealPaymentModel();
        const LocalDealModel = getLocalDealModel();

        if (!LocalDealPaymentModel) {
            return next(
                new ErrorResponse("Deal Payment model unavailable", 500),
            );
        }

        if (!LocalDealModel) {
            return next(new ErrorResponse("Deal model unavailable", 500));
        }

        const userId = req.session.user?._id;
        if (!userId) return next(new ErrorResponse("Not authorized", 401));

        const { dealId, amount, currency = "usd" } = req.body;

        if (!dealId || !amount || Number(amount) <= 0) {
            return next(
                new ErrorResponse("Deal ID and valid amount are required", 400),
            );
        }

        // Fetch the deal and validate user is party to it
        const deal = await LocalDealModel.findById(dealId)
            .populate("investorId", "_id name email")
            .populate("startupId", "_id name email");

        if (!deal) {
            return next(new ErrorResponse("Deal not found", 404));
        }

        const investorId = deal.investorId._id?.toString();
        const startupId = deal.startupId._id?.toString();
        const isUserInvolved =
            userId.toString() === investorId || userId.toString() === startupId;

        if (!isUserInvolved) {
            return next(
                new ErrorResponse("You are not a party to this deal", 403),
            );
        }

        // Determine who is paying and who is receiving
        const paidBy = userId;
        const receivedBy =
            userId.toString() === investorId ? startupId : investorId;

        try {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                line_items: [
                    {
                        price_data: {
                            currency,
                            product_data: {
                                name: `Payment for deal: ${deal.title}`,
                            },
                            unit_amount: Math.round(Number(amount) * 100),
                        },
                        quantity: 1,
                    },
                ],
                mode: "payment",
                success_url:
                    req.body.success_url ||
                    process.env.STRIPE_SUCCESS_URL ||
                    "http://localhost:5173/success",
                cancel_url:
                    req.body.cancel_url ||
                    process.env.STRIPE_CANCEL_URL ||
                    "http://localhost:5173/cancel",
                metadata: {
                    userId: userId.toString(),
                    dealId: dealId,
                    paidBy: paidBy.toString(),
                    receivedBy: receivedBy.toString(),
                },
            });

            // Store deal payment record
            const dealPaymentDoc = await LocalDealPaymentModel.create({
                userId: paidBy,
                dealId,
                paidBy,
                receivedBy,
                amount: Number(amount),
                currency,
                stripeSessionId: session.id,
                status: "pending",
                type: "one_time",
                description: `Payment for deal: ${deal.title}`,
                metadata: {
                    dealTitle: deal.title,
                    startupName: (deal.startupId as any)?.name || "Startup",
                    investorName: (deal.investorId as any)?.name || "Investor",
                },
            });

            res.status(201).json({
                success: true,
                url: session.url,
                id: dealPaymentDoc._id,
                message: "Deal payment session created",
            });
        } catch (error: any) {
            next(new ErrorResponse(error.message || "Stripe error", 500));
        }
    },
);

export const getSuccessfulDealPayments = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const LocalDealPaymentModel = getLocalDealPaymentModel();
        if (!LocalDealPaymentModel)
            return next(
                new ErrorResponse("Deal Payment model unavailable", 500),
            );

        const userId = req.session.user?._id;
        if (!userId) return next(new ErrorResponse("Not authorized", 401));

        // Get payments where user is either payer or receiver and status is succeeded
        const payments = await LocalDealPaymentModel.find({
            $or: [{ paidBy: userId }, { receivedBy: userId }],
            status: "succeeded",
        })
            .populate("dealId", "title amount equity stage status")
            .populate("paidBy", "_id name email")
            .populate("receivedBy", "_id name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: payments.length,
            payments,
        });
    },
);

export const getPaymentsByDeal = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const LocalDealPaymentModel = getLocalDealPaymentModel();
        const LocalDealModel = getLocalDealModel();

        if (!LocalDealPaymentModel)
            return next(
                new ErrorResponse("Deal Payment model unavailable", 500),
            );

        if (!LocalDealModel)
            return next(new ErrorResponse("Deal model unavailable", 500));

        const userId = req.session.user?._id;
        if (!userId) return next(new ErrorResponse("Not authorized", 401));

        const { dealId } = req.params;

        if (!dealId) return next(new ErrorResponse("Deal ID is required", 400));

        // Verify user is party to the deal
        const deal = await LocalDealModel.findById(dealId);
        if (!deal) return next(new ErrorResponse("Deal not found", 404));

        const investorId = deal.investorId?.toString();
        const startupId = deal.startupId?.toString();
        const isUserParty =
            userId.toString() === investorId || userId.toString() === startupId;

        if (!isUserParty)
            return next(
                new ErrorResponse("You are not a party to this deal", 403),
            );

        // Get all payments for this deal
        const payments = await LocalDealPaymentModel.find({
            dealId,
            status: "succeeded",
        })
            .populate("paidBy", "_id name email")
            .populate("receivedBy", "_id name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: payments.length,
            payments,
        });
    },
);

export const stripeWebhookHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const sig = req.headers["stripe-signature"] as string | undefined;
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        let event: any;

        try {
            const payload = (req as any).rawBody || JSON.stringify(req.body);
            if (webhookSecret && sig) {
                event = stripe.webhooks.constructEvent(
                    payload,
                    sig,
                    webhookSecret,
                );
            } else {
                event = req.body;
            }
        } catch (err: any) {
            console.error(
                "Webhook signature verification failed.",
                err.message,
            );
            res.status(400).send(`Webhook Error: ${err.message}`);
            return;
        }

        const LocalDealPaymentModel = getLocalDealPaymentModel();
        if (!LocalDealPaymentModel) {
            res.status(500).send("Payment model unavailable");
            return;
        }

        try {
            switch (event.type) {
                case "checkout.session.completed": {
                    const session = event.data.object;
                    const sessionId = session.id;
                    const paymentIntentId = session.payment_intent;

                    // Handle deal payment
                    const dealPayment = await LocalDealPaymentModel.findOne({
                        stripeSessionId: sessionId,
                    });

                    if (dealPayment) {
                        dealPayment.status = "succeeded";
                        dealPayment.stripePaymentIntentId =
                            paymentIntentId ||
                            dealPayment.stripePaymentIntentId;
                        await dealPayment.save();

                        // notify both parties
                        const paidByUser = dealPayment.paidBy?.toString();
                        const receivedByUser =
                            dealPayment.receivedBy?.toString();

                        if (paidByUser) {
                            await createNotificationUtil(
                                {
                                    sender: paidByUser,
                                    recipient: paidByUser,
                                    message: `Payment of ${dealPayment.amount} ${dealPayment.currency} for deal succeeded.`,
                                    type: "PAYMENT_RECEIVED",
                                    link: dealPayment._id,
                                },
                                getLocalNotificationModel,
                            );
                        }

                        if (receivedByUser) {
                            await createNotificationUtil(
                                {
                                    sender: paidByUser || "",
                                    recipient: receivedByUser,
                                    message: `Received payment of ${dealPayment.amount} ${dealPayment.currency} for deal.`,
                                    type: "PAYMENT_RECEIVED",
                                    link: dealPayment._id,
                                },
                                getLocalNotificationModel,
                            );
                        }
                    }

                    break;
                }

                case "payment_intent.succeeded": {
                    const pi = event.data.object;
                    const dealPayment = await LocalDealPaymentModel.findOne({
                        stripePaymentIntentId: pi.id,
                    });

                    if (dealPayment) {
                        dealPayment.status = "succeeded";
                        await dealPayment.save();

                        const paidByUser = dealPayment.paidBy?.toString();
                        const receivedByUser =
                            dealPayment.receivedBy?.toString();

                        if (paidByUser) {
                            await createNotificationUtil(
                                {
                                    sender: paidByUser,
                                    recipient: paidByUser,
                                    message: `Payment of ${dealPayment.amount} ${dealPayment.currency} for deal succeeded.`,
                                    type: "PAYMENT_RECEIVED",
                                    link: dealPayment._id,
                                },
                                getLocalNotificationModel,
                            );
                        }

                        if (receivedByUser) {
                            await createNotificationUtil(
                                {
                                    sender: paidByUser || "",
                                    recipient: receivedByUser,
                                    message: `Received payment of ${dealPayment.amount} ${dealPayment.currency} for deal.`,
                                    type: "PAYMENT_RECEIVED",
                                    link: dealPayment._id,
                                },
                                getLocalNotificationModel,
                            );
                        }
                    }
                    break;
                }

                case "payment_intent.payment_failed": {
                    const pi = event.data.object;
                    const dealPayment = await LocalDealPaymentModel.findOne({
                        stripePaymentIntentId: pi.id,
                    });

                    if (dealPayment) {
                        dealPayment.status = "failed";
                        await dealPayment.save();
                    }
                    break;
                }

                default:
                    break;
            }

            res.json({ received: true });
        } catch (err) {
            console.error(err);
            res.status(500).send("Webhook handler error");
        }
    },
);

export const verifyPaymentSession = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        const LocalDealPaymentModel = getLocalDealPaymentModel();
        if (!LocalDealPaymentModel)
            return next(
                new ErrorResponse("Deal Payment model unavailable", 500),
            );

        const { session_id } = req.query;

        if (!session_id || typeof session_id !== "string") {
            return res.status(400).json({
                success: false,
                message: "Valid session_id query parameter required",
            });
        }

        try {
            console.log("Verifying payment session:", session_id);

            // Get payment from database using session ID
            const payment = await LocalDealPaymentModel.findOne({
                stripeSessionId: session_id,
            })
                .populate("dealId", "title amount equity stage status")
                .populate("paidBy", "_id name email")
                .populate("receivedBy", "_id name email");

            if (!payment) {
                console.warn("Payment not found for session:", session_id);
                return res.status(404).json({
                    success: false,
                    message: "Payment session not found in database",
                });
            }

            console.log("Payment found, current status:", payment.status);

            // Retrieve session from Stripe to verify current status
            const session = await stripe.checkout.sessions.retrieve(session_id);

            if (!session) {
                console.warn("Session not found on Stripe:", session_id);
                return res.status(404).json({
                    success: false,
                    message: "Session not found on Stripe",
                });
            }

            console.log("Stripe session status:", session.payment_status);

            // Update payment status if it changed and not already updated by webhook
            if (
                session.payment_status === "paid" &&
                payment.status !== "succeeded"
            ) {
                console.log("Updating payment status to succeeded");
                payment.status = "succeeded";
                payment.stripePaymentIntentId =
                    session.payment_intent as string;
                await payment.save();

                // Create notifications if just updated
                const paidByUser = payment.paidBy?.toString();
                const receivedByUser = payment.receivedBy?.toString();

                if (paidByUser) {
                    await createNotificationUtil(
                        {
                            sender: paidByUser,
                            recipient: paidByUser,
                            message: `Payment of ${payment.amount} ${payment.currency} for deal succeeded.`,
                            type: "PAYMENT_RECEIVED",
                            link: payment._id,
                        },
                        getLocalNotificationModel,
                    );
                }

                if (receivedByUser) {
                    await createNotificationUtil(
                        {
                            sender: paidByUser || "",
                            recipient: receivedByUser,
                            message: `Received payment of ${payment.amount} ${payment.currency} for deal.`,
                            type: "PAYMENT_RECEIVED",
                            link: payment._id,
                        },
                        getLocalNotificationModel,
                    );
                }
            } else if (
                session.payment_status === "unpaid" &&
                payment.status === "pending"
            ) {
                console.log("PaymentRemains pending");
                payment.status = "pending";
            } else if (
                (session.payment_status as string).startsWith("fail") &&
                payment.status !== "failed"
            ) {
                console.log("Updating payment status to failed");
                payment.status = "failed";
                await payment.save();
            }

            return res.status(200).json({
                success:
                    session.payment_status === "paid" ||
                    payment.status === "succeeded",
                message:
                    payment.status === "succeeded"
                        ? "Payment verified successfully"
                        : `Payment status: ${payment.status}`,
                paymentId: payment._id,
                payment: {
                    _id: payment._id,
                    amount: payment.amount,
                    currency: payment.currency,
                    status: payment.status,
                    dealId: payment.dealId,
                    paidBy: payment.paidBy,
                    receivedBy: payment.receivedBy,
                    createdAt: payment.createdAt,
                },
            });
        } catch (error: any) {
            console.error("Verify payment error:", error);
            return res.status(500).json({
                success: false,
                message: error.message || "Payment verification failed",
            });
        }
    },
);
