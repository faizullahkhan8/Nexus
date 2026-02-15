"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const LocalDb_1 = require("./db/LocalDb");
const express_session_1 = __importDefault(require("express-session"));
const dotenv_1 = __importDefault(require("dotenv"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const socket_io_1 = require("socket.io");
const node_http_1 = require("node:http");
const auth_router_1 = __importDefault(require("./routers/auth.router"));
const request_router_1 = __importDefault(require("./routers/request.router"));
const notification_router_1 = __importDefault(require("./routers/notification.router"));
const message_router_1 = __importDefault(require("./routers/message.router"));
const document_router_1 = __importDefault(require("./routers/document.router"));
const deal_router_1 = __importDefault(require("./routers/deal.router"));
const meeting_router_1 = __importDefault(require("./routers/meeting.router"));
const stripe_router_1 = __importDefault(require("./routers/stripe.router"));
const ErrorHandler_1 = require("./middlewares/ErrorHandler");
dotenv_1.default.config();
const corsOptions = {
    origin: [process.env.FRONTEND_URL || "", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
};
const app = (0, express_1.default)();
const server = (0, node_http_1.createServer)(app);
exports.io = new socket_io_1.Server(server, {
    cors: corsOptions,
});
app.use(express_1.default.json({ limit: "50mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "50mb" }));
app.use((0, cors_1.default)(corsOptions));
const sessionMiddleware = (0, express_session_1.default)({
    name: "session",
    secret: process.env.SESSION_SECRET || "",
    store: connect_mongo_1.default.create({
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
app.use("/api/auth/", auth_router_1.default);
app.use("/api/request/", request_router_1.default);
app.use("/api/notification/", notification_router_1.default);
app.use("/api/message/", message_router_1.default);
app.use("/api/document/", document_router_1.default);
app.use("/api/deal/", deal_router_1.default);
app.use("/api/meeting/", meeting_router_1.default);
app.use("/api/stripe/", stripe_router_1.default);
exports.io.engine.use(sessionMiddleware);
exports.io.on("connection", (socket) => {
    const session = socket.request.session;
    if (!Boolean(session.user?._id)) {
        socket.disconnect();
    }
    console.log("Socket Connected: ", session.user?._id);
    socket.join(`user:${session.user?._id}`);
    socket.on("disconnect", (reason) => {
        console.log(reason);
    });
    const emitToUser = (event, payload) => {
        if (!payload?.to)
            return;
        exports.io.to(`user:${payload.to}`).emit(event, {
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
exports.io.use((socket, next) => {
    const session = socket.request.session;
    if (!session || !session.user) {
        return next(new Error("Unauthorized"));
    }
    next();
});
// Connect to DB once at startup, then start the server
(0, LocalDb_1.connectLocalDb)()
    .then(() => {
    console.log("✅ Database connected successfully");
    server.listen(process.env.PORT || 3000, () => {
        console.log(`Server is running on port ${process.env.PORT || 3000}`);
    });
})
    .catch((err) => {
    console.error("❌ Initial DB connection failed:", err);
    process.exit(1);
});
app.use(ErrorHandler_1.ErrorHandler);
