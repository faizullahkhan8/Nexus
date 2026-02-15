import express from "express";
import cors from "cors";

import { connectLocalDb } from "./db/LocalDb";
import session from "express-session";
import dotenv from "dotenv";
import MongoStore from "connect-mongo";
import { Server } from "socket.io";
import { createServer } from "node:http";

import AuthRouter from "./routers/auth.router";
import RequestRouter from "./routers/request.router";
import NotificationRouter from "./routers/notification.router";
import MessageRouter from "./routers/message.router";
import DocumentRouter from "./routers/document.router";
import DealRouter from "./routers/deal.router";
import MeetingRouter from "./routers/meeting.router";
import StripeRouter from "./routers/stripe.router";

import { ErrorHandler } from "./middlewares/ErrorHandler";

dotenv.config();

const corsOptions = {
    origin: [process.env.FRONTEND_URL || "", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
};

const app = express();
const server = createServer(app);
export const io = new Server(server, {
    cors: corsOptions,
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use(cors(corsOptions));

const sessionMiddleware = session({
    name: "session",
    secret: process.env.SESSION_SECRET || "",
    store: MongoStore.create({
        mongoUrl: process.env.DB_URI,
        collectionName: "sessions",
        ttl: 60 * 60 * 24, // 1 day in seconds
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 day in milliseconds
        httpOnly: true,
        secure: false,
        sameSite: "lax",
    },
});

app.use(sessionMiddleware);

app.use("/api/auth/", AuthRouter);
app.use("/api/request/", RequestRouter);
app.use("/api/notification/", NotificationRouter);
app.use("/api/message/", MessageRouter);
app.use("/api/document/", DocumentRouter);
app.use("/api/deal/", DealRouter);
app.use("/api/meeting/", MeetingRouter);
app.use("/api/stripe/", StripeRouter);

io.engine.use(sessionMiddleware);

io.on("connection", (socket) => {
    const session = socket.request.session;

    if (!Boolean(session.user?._id)) {
        socket.disconnect();
    }

    console.log("Socket Connected: ", session.user?._id);
    socket.join(`user:${session.user?._id}`);

    socket.on("disconnect", (reason) => {
        console.log(reason);
    });

    const emitToUser = (
        event: string,
        payload: { to?: string; callId?: string; [key: string]: any },
    ) => {
        if (!payload?.to) return;
        io.to(`user:${payload.to}`).emit(event, {
            ...payload,
            from: {
                _id: session.user?._id,
                name: session.user?.name,
                avatarUrl: payload?.from?.avatarUrl,
            },
        });
    };

    socket.on("call:offer", (payload) => emitToUser("call:offer", payload));
    socket.on("call:answer", (payload) => emitToUser("call:answer", payload));
    socket.on("call:ice", (payload) => emitToUser("call:ice", payload));
    socket.on("call:reject", (payload) => emitToUser("call:reject", payload));
    socket.on("call:hangup", (payload) => emitToUser("call:hangup", payload));
    socket.on("call:busy", (payload) => emitToUser("call:busy", payload));
});

io.use((socket, next) => {
    const session = socket.request.session;
    if (!session || !session.user) {
        return next(new Error("Unauthorized"));
    }
    next();
});

// Connect to DB once at startup, then start the server
connectLocalDb()
    .then(() => {
        console.log("✅ Database connected successfully");
        server.listen(process.env.PORT || 3000, () => {
            console.log(
                `Server is running on port ${process.env.PORT || 3000}`,
            );
        });
    })
    .catch((err) => {
        console.error("❌ Initial DB connection failed:", err);
        process.exit(1);
    });

app.use(ErrorHandler);
