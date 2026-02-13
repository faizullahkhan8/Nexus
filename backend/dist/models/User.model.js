"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSchema = void 0;
const mongoose_1 = require("mongoose");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
exports.UserSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    role: {
        type: String,
        required: true,
        enum: ["entrepreneur", "investor"],
    },
    isOnline: {
        type: Boolean,
        default: true,
    },
    avatarUrl: {
        type: String,
        trim: true,
    },
    bio: {
        type: String,
        trim: true,
    },
    twoFactor: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
exports.UserSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }
    try {
        const salt = await bcryptjs_1.default.genSalt(10);
        this.password = await bcryptjs_1.default.hash(this.password, salt);
    }
    catch (error) {
        throw error;
    }
});
exports.UserSchema.methods.ComparePassword = async function (enteredPassword) {
    return await bcryptjs_1.default.compare(enteredPassword, this.password);
};
