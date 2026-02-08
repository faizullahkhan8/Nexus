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
import { ErrorHandler } from "./middlewares/ErrorHandler";

dotenv.config();

const corsOptions = {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
};

const app = express();
const server = createServer(app);
export const io = new Server(server, {
    cors: corsOptions,
});
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

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
});

io.use((socket, next) => {
    const session = socket.request.session;
    if (!session || !session.user) {
        return next(new Error("Unauthorized"));
    }
    next();
});

server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    connectLocalDb();
});

app.use(ErrorHandler);
