import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import {
    getLocalEntrepreneurModel,
    getLocalInvestorModel,
    getLocalUserModel,
} from "../db/LocalDb";
import ErrorResponse from "../utils/ErrorResponse";
import {
    loginSchema,
    signupSchema,
} from "../utils/validations/auth.validations";
import { entrepreneurProfileSchema } from "../utils/validations/profiles.validations";

export const signup = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const LocalUserModel = getLocalUserModel();
        const LocalEntrepreneurModel = getLocalEntrepreneurModel();
        const LocalInvestorModel = getLocalInvestorModel();

        signupSchema.validate({ body: req.body });

        const { name, email, password, role } = req.body;

        const userExists = await LocalUserModel.findOne({ email });
        if (userExists) {
            return next(new ErrorResponse("User already exists", 400));
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
            } else if (role === "investor") {
                await LocalInvestorModel.create({
                    user: user._id,
                    investmentInterests: [],
                    investmentStages: [],
                    portfolioCompanies: [],
                    investmentRange: { minAmount: 0, maxAmount: 0 },
                    location: "Not Specified",
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
                },
            });
        } else {
            return next(new ErrorResponse("Invalid user data", 400));
        }
    },
);

export const login = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const LocalUserModel = getLocalUserModel();

        loginSchema.validate({ body: req.body });

        const { email, password, role } = req.body;

        const user = await LocalUserModel.findOne({ email });

        if (!user) {
            return next(new ErrorResponse("Invalid credientails", 401));
        }

        if (role !== user.role) {
            return next(new ErrorResponse("Invalid credientails", 401));
        }

        if (user && (await user.ComparePassword(password))) {
            req.session.user = {
                _id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
            };

            res.status(200).json({
                success: true,
                message: "Login successful",
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            });
        } else {
            return next(new ErrorResponse("Invalid credientails", 401));
        }
    },
);

export const logout = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        req.session.destroy((err) => {
            if (err) {
                return next(
                    new ErrorResponse(
                        "Could not log out, please try again",
                        500,
                    ),
                );
            }

            res.clearCookie("connect.sid");

            res.status(200).json({
                success: true,
                message: "Logged out successfully",
            });
        });
    },
);

export const getMe = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const LocalUserModel = getLocalUserModel();
        const role = req.session.user?.role;
        const userId = req.session.user?._id;

        const user = await LocalUserModel.findById(userId).select("-password");

        if (!user) {
            return next(new ErrorResponse("User not found", 404));
        }

        let profile = null;

        if (role === "entrepreneur") {
            const EntrepreneurModel = getLocalEntrepreneurModel();
            profile = await EntrepreneurModel.findOne({
                user: userId,
            }).populate("connections", "name email");
            // .populate("sharedWithMeDocs")
        } else if (role === "investor") {
            const InvestorModel = getLocalInvestorModel();
            profile = await InvestorModel.findOne({ user: userId });
        }

        res.status(200).json({
            success: true,
            user,
            profile,
        });
    },
);

export const changePassword = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const LocalUserModel = getLocalUserModel();
        const { currentPassword, newPassword } = req.body;

        const user = await LocalUserModel.findById(req.session.user?._id);

        if (!user) {
            return next(new ErrorResponse("Not authorized", 401));
        }

        const isMatch = await user.ComparePassword(currentPassword);

        if (!isMatch) {
            return next(new ErrorResponse("Incorrect current password", 401));
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password updated successfully",
        });
    },
);

export const toggleTwoFactor = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const LocalUserModel = getLocalUserModel();

        const user = await LocalUserModel.findById(req.session.user?._id);

        if (!user) {
            return next(new ErrorResponse("User not found", 404));
        }

        user.twoFactor = !user.twoFactor;
        await user.save();

        res.status(200).json({
            success: true,
            message: `Two-factor authentication ${user.twoFactor ? "enabled" : "disabled"}`,
            twoFactor: user.twoFactor,
        });
    },
);

// entrepreneur controllers
export const updateEntrepreneurProfile = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const LocalEntrepreneurModel = getLocalEntrepreneurModel();

        entrepreneurProfileSchema.validate({ body: req.body });

        const profile = await LocalEntrepreneurModel.findOneAndUpdate(
            { user: req.session.user?._id },
            req.body,
            { new: true, runValidators: true },
        );

        if (!profile) {
            return next(new ErrorResponse("Profile not found", 404));
        }

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            profile,
        });
    },
);

export const getSingleEntrepreneur = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const LocalEntrepreneurModel = getLocalEntrepreneurModel();
        const { id: userId } = req.params;

        const entrepreneur = await LocalEntrepreneurModel.findOne({
            user: userId,
        })
            .populate("user", "_id name email role isOnline avatarUrl")
            .populate("connections", "_id name email");

        if (!entrepreneur) {
            return next(
                new ErrorResponse("Entrepreneur profile not found", 404),
            );
        }

        entrepreneur.profileViews += 1;
        await entrepreneur.save();

        res.status(200).json({
            success: true,
            message: "Entrepreneur profile fetched successfully",
            entrepreneur,
        });
    },
);

export const getAllEntrepreneurs = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const LocalEntrepreneurModel = getLocalEntrepreneurModel();

        const entrepreneurs = await LocalEntrepreneurModel.find()
            .populate("user", "name email role")
            .populate("connections", "name email");

        if (!entrepreneurs) {
            return next(new ErrorResponse("No entrepreneurs found", 404));
        }

        res.status(200).json({
            success: true,
            message: "Entrepreneurs fetched successfully",
            count: entrepreneurs.length,
            entrepreneurs,
        });
    },
);

// investor controller
export const updateInvestorProfile = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const LocalInvestorModel = getLocalInvestorModel();

        const profile = await LocalInvestorModel.findOneAndUpdate(
            { user: req.session.user?._id },
            { $set: req.body },
            {
                new: true,
                runValidators: true,
            },
        );

        if (!profile) {
            return next(new ErrorResponse("Investor profile not found", 404));
        }

        res.status(200).json({
            success: true,
            message: "Investor profile updated successfully",
            profile,
        });
    },
);

export const getSingleInvestor = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const LocalInvestorModel = getLocalInvestorModel();
        const { id } = req.params;

        const investor = await LocalInvestorModel.findById(id).populate(
            "user",
            "name email role",
        );

        if (!investor) {
            return next(new ErrorResponse("Investor profile not found", 404));
        }

        investor.profileViews += 1;
        await investor.save();

        res.status(200).json({
            success: true,
            message: "Investor profile fetched successfully",
            investor,
        });
    },
);

export const getAllInvestors = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const LocalInvestorModel = getLocalInvestorModel();

        const investors = await LocalInvestorModel.find().populate(
            "user",
            "name email role",
        );

        if (!investors || investors.length === 0) {
            return next(new ErrorResponse("No investors found", 404));
        }

        res.status(200).json({
            success: true,
            message: "Investors fetched successfully",
            count: investors.length,
            investors,
        });
    },
);
