"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.investorProfileSchema = exports.entrepreneurProfileSchema = void 0;
const yup = __importStar(require("yup"));
exports.entrepreneurProfileSchema = yup.object({
    body: yup.object({
        startupName: yup.string().required("Startup name is required").trim(),
        industry: yup.string().required("Industry is required"),
        pitchSummary: yup.string().required("Pitch summary is required"),
        fundingRound: yup
            .array()
            .of(yup.object({
            round: yup.number().required("Funding round is required"),
            amount: yup
                .number()
                .min(0)
                .required("Funding amount is required"),
            isCurrent: yup.boolean().default(false),
            date: yup.date().required("Funding date is required"),
        }))
            .min(1, "At least one funding round is required"),
        location: yup.string().required("Location is required"),
        foundedYear: yup
            .number()
            .integer()
            .min(1800)
            .max(new Date().getFullYear())
            .required(),
        startupOverview: yup
            .array()
            .of(yup.object({
            heading: yup.string().required("Heading is required"),
            paragraph: yup.string().required("Paragraph is required"),
        }))
            .min(1, "At least one overview section is required"),
        team: yup
            .array()
            .of(yup.object({
            name: yup.string().required("Member name is required"),
            avatarUrl: yup.string().url("Invalid avatar URL"),
            role: yup.string().required("Member role is required"),
        }))
            .min(1, "At least one team member is required"),
    }),
});
exports.investorProfileSchema = yup.object({
    body: yup.object({
        investmentInterests: yup.array().of(yup.string()),
        investmentStages: yup.array().of(yup.string()),
        portfolioCompanies: yup.array().of(yup.string()),
        investmentRange: yup.object({
            minAmount: yup.number().min(0),
            maxAmount: yup.number().min(0),
        }),
        investmentCriteria: yup.array().of(yup.string()),
        location: yup.string(),
    }),
});
