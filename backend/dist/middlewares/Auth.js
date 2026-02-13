"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.protect = void 0;
const ErrorResponse_1 = __importDefault(require("../utils/ErrorResponse"));
const protect = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    else {
        throw new ErrorResponse_1.default("Not authorized, please log in", 401);
    }
};
exports.protect = protect;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.session.user?.role)) {
            throw new ErrorResponse_1.default(`User role ${req.session.user?.role} is not authorized to access this route`, 403);
        }
        next();
    };
};
exports.authorize = authorize;
