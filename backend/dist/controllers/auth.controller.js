"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllInvestors = exports.getSingleInvestor = exports.updateInvestorProfile = exports.getAllEntrepreneurs = exports.getSingleEntrepreneur = exports.updateEntrepreneurProfile = exports.toggleTwoFactor = exports.changePassword = exports.getMe = exports.logout = exports.login = exports.signup = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const LocalDb_1 = require("../db/LocalDb");
const ErrorResponse_1 = __importDefault(require("../utils/ErrorResponse"));
const auth_validations_1 = require("../utils/validations/auth.validations");
const profiles_validations_1 = require("../utils/validations/profiles.validations");
exports.signup = (0, express_async_handler_1.default)(async (req, res, next) => {
    const LocalUserModel = (0, LocalDb_1.getLocalUserModel)();
    const LocalEntrepreneurModel = (0, LocalDb_1.getLocalEntrepreneurModel)();
    const LocalInvestorModel = (0, LocalDb_1.getLocalInvestorModel)();
    auth_validations_1.signupSchema.validate({ body: req.body });
    const { name, email, password, role } = req.body;
    const userExists = await LocalUserModel.findOne({ email });
    if (userExists) {
        return next(new ErrorResponse_1.default("User already exists", 400));
    }
    const user = await LocalUserModel.create({
        name,
        email,
        password,
        role,
    });
    if (user) {
        if (role === "entrepreneur") {
            await LocalEntrepreneurModel.create({
                user: user._id,
                startupName: "My Startup",
                industry: "Not Specified",
                pitchSummary: "Draft Summary",
                location: "Not Specified",
                foundedYear: new Date().getFullYear(),
                startupOverview: [],
                team: [],
            });
        }
        else if (role === "investor") {
            await LocalInvestorModel.create({
                user: user._id,
                investmentInterests: [],
                investmentStages: [],
                portfolioCompanies: [],
                investmentRange: { minAmount: 0, maxAmount: 0 },
                location: "Not Specified",
                bio: "Not Specified",
            });
        }
        req.session.user = {
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
        };
        res.status(201).json({
            success: true,
            message: "User registered and profile initialized successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatarUrl: user.avatarUrl,
            },
        });
    }
    else {
        return next(new ErrorResponse_1.default("Invalid user data", 400));
    }
});
exports.login = (0, express_async_handler_1.default)(async (req, res, next) => {
    const LocalUserModel = (0, LocalDb_1.getLocalUserModel)();
    auth_validations_1.loginSchema.validate({ body: req.body });
    const { email, password, role } = req.body;
    const user = await LocalUserModel.findOne({ email });
    if (!user) {
        return next(new ErrorResponse_1.default("Invalid credientails", 401));
    }
    if (role !== user.role) {
        return next(new ErrorResponse_1.default("Invalid credientails", 401));
    }
    if (user && (await user.ComparePassword(password))) {
        req.session.user = {
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
        };
        user.isOnline = true;
        await user.save({ validateModifiedOnly: true });
        res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatarUrl: user.avatarUrl,
            },
        });
    }
    else {
        return next(new ErrorResponse_1.default("Invalid credientails", 401));
    }
});
exports.logout = (0, express_async_handler_1.default)(async (req, res, next) => {
    const LocalUserModel = (0, LocalDb_1.getLocalUserModel)();
    await LocalUserModel.updateOne({
        _id: req.session.user?._id,
    }, { isOnline: false });
    req.session.destroy((err) => {
        if (err) {
            return next(new ErrorResponse_1.default("Could not log out, please try again", 500));
        }
        res.clearCookie("connect.sid");
        res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    });
});
exports.getMe = (0, express_async_handler_1.default)(async (req, res, next) => {
    const LocalUserModel = (0, LocalDb_1.getLocalUserModel)();
    const role = req.session.user?.role;
    const userId = req.session.user?._id;
    const user = await LocalUserModel.findById(userId).select("-password");
    if (!user) {
        return next(new ErrorResponse_1.default("User not found", 404));
    }
    let profile = null;
    if (role === "entrepreneur") {
        const EntrepreneurModel = (0, LocalDb_1.getLocalEntrepreneurModel)();
        profile = await EntrepreneurModel.findOne({
            user: userId,
        }).populate("connections", "name email avatarUrl _id isOnline");
        // .populate("sharedWithMeDocs")
    }
    else if (role === "investor") {
        const InvestorModel = (0, LocalDb_1.getLocalInvestorModel)();
        profile = await InvestorModel.findOne({ user: userId });
    }
    res.status(200).json({
        success: true,
        user,
        profile,
    });
});
exports.changePassword = (0, express_async_handler_1.default)(async (req, res, next) => {
    const LocalUserModel = (0, LocalDb_1.getLocalUserModel)();
    const { currentPassword, newPassword } = req.body;
    const user = await LocalUserModel.findById(req.session.user?._id);
    if (!user) {
        return next(new ErrorResponse_1.default("Not authorized", 401));
    }
    const isMatch = await user.ComparePassword(currentPassword);
    if (!isMatch) {
        return next(new ErrorResponse_1.default("Incorrect current password", 401));
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({
        success: true,
        message: "Password updated successfully",
    });
});
exports.toggleTwoFactor = (0, express_async_handler_1.default)(async (req, res, next) => {
    const LocalUserModel = (0, LocalDb_1.getLocalUserModel)();
    const user = await LocalUserModel.findById(req.session.user?._id);
    if (!user) {
        return next(new ErrorResponse_1.default("User not found", 404));
    }
    user.twoFactor = !user.twoFactor;
    await user.save();
    res.status(200).json({
        success: true,
        message: `Two-factor authentication ${user.twoFactor ? "enabled" : "disabled"}`,
        twoFactor: user.twoFactor,
    });
});
// entrepreneur controllers
exports.updateEntrepreneurProfile = (0, express_async_handler_1.default)(async (req, res, next) => {
    const LocalEntrepreneurModel = (0, LocalDb_1.getLocalEntrepreneurModel)();
    profiles_validations_1.entrepreneurProfileSchema.validate({ body: req.body });
    const profile = await LocalEntrepreneurModel.findOneAndUpdate({ user: req.session.user?._id }, req.body, { new: true, runValidators: true });
    if (!profile) {
        return next(new ErrorResponse_1.default("Profile not found", 404));
    }
    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        profile,
    });
});
exports.getSingleEntrepreneur = (0, express_async_handler_1.default)(async (req, res, next) => {
    const LocalEntrepreneurModel = (0, LocalDb_1.getLocalEntrepreneurModel)();
    const { id: userId } = req.params;
    const entrepreneur = await LocalEntrepreneurModel.findOne({
        user: userId,
    })
        .populate("user", "_id name email role isOnline avatarUrl")
        .populate("connections", "_id name email isOnline avatarUrl");
    if (!entrepreneur) {
        return next(new ErrorResponse_1.default("Entrepreneur profile not found", 404));
    }
    entrepreneur.profileViews += 1;
    await entrepreneur.save();
    res.status(200).json({
        success: true,
        message: "Entrepreneur profile fetched successfully",
        entrepreneur,
    });
});
exports.getAllEntrepreneurs = (0, express_async_handler_1.default)(async (req, res, next) => {
    const LocalEntrepreneurModel = (0, LocalDb_1.getLocalEntrepreneurModel)();
    const entrepreneurs = await LocalEntrepreneurModel.find()
        .populate("user", "name email role isOnline avatarUrl")
        .populate("connections", "name email");
    if (!entrepreneurs) {
        return next(new ErrorResponse_1.default("No entrepreneurs found", 404));
    }
    res.status(200).json({
        success: true,
        message: "Entrepreneurs fetched successfully",
        count: entrepreneurs.length,
        entrepreneurs,
    });
});
// investor controller
exports.updateInvestorProfile = (0, express_async_handler_1.default)(async (req, res, next) => {
    const LocalInvestorModel = (0, LocalDb_1.getLocalInvestorModel)();
    const profile = await LocalInvestorModel.findOneAndUpdate({ user: req.session.user?._id }, { $set: req.body }, {
        new: true,
        runValidators: true,
    });
    if (!profile) {
        return next(new ErrorResponse_1.default("Investor profile not found", 404));
    }
    res.status(200).json({
        success: true,
        message: "Investor profile updated successfully",
        profile,
    });
});
exports.getSingleInvestor = (0, express_async_handler_1.default)(async (req, res, next) => {
    const LocalInvestorModel = (0, LocalDb_1.getLocalInvestorModel)();
    const { id } = req.params;
    const investor = await LocalInvestorModel.findOne({
        user: id,
    }).populate("user", "name email role isOnline avatarUrl");
    if (!investor) {
        return next(new ErrorResponse_1.default("Investor profile not found", 404));
    }
    investor.profileViews += 1;
    await investor.save();
    res.status(200).json({
        success: true,
        message: "Investor profile fetched successfully",
        investor,
    });
});
exports.getAllInvestors = (0, express_async_handler_1.default)(async (req, res, next) => {
    const LocalInvestorModel = (0, LocalDb_1.getLocalInvestorModel)();
    const investors = await LocalInvestorModel.find().populate("user", "name email role isOnline avatarUrl");
    if (!investors || investors.length === 0) {
        return next(new ErrorResponse_1.default("No investors found", 404));
    }
    res.status(200).json({
        success: true,
        message: "Investors fetched successfully",
        count: investors.length,
        investors,
    });
});
