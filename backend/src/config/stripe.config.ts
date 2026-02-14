import Stripe from "stripe";

const stripe = new Stripe(
    process.env.STRIPE_SECRET_KEY ||
        "sk_test_51SC38W36Ing01WhlP3rJXqsL2f1lhFcyb8eBED1scnCNvQ4yg5h3cctljS3rlvH2XPTMnnhAP2IEi7SOb6leGQKA00mkU1qYot",
    {
        apiVersion: "2026-01-28.clover",
        typescript: true,
    },
);

export default stripe;
