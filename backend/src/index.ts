import express from "express";
import cors from "cors";

import { connectLocalDb } from "./db/LocalDb";
import session from "express-session";
import dotenv from "dotenv";
import MongoStore from "connect-mongo";

import AuthRouter from "./routers/auth.router";
import RequestRouter from "./routers/request.router";
import { ErrorHandler } from "./middlewares/ErrorHandler";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
    cors({
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    }),
);

app.use(
    session({
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
    }),
);

app.use("/api/auth/", AuthRouter);
app.use("/api/request/", RequestRouter);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    connectLocalDb();
});

app.use(ErrorHandler);
