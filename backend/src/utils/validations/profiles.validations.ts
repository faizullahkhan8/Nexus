import * as yup from "yup";

export const entrepreneurProfileSchema = yup.object({
    body: yup.object({
        startupName: yup.string().required("Startup name is required").trim(),
        industry: yup.string().required("Industry is required"),
        pitchSummary: yup.string().required("Pitch summary is required"),
        fundingRound: yup
            .array()
            .of(
                yup.object({
                    round: yup.number().required("Funding round is required"),
                    amount: yup
                        .number()
                        .min(0)
                        .required("Funding amount is required"),
                    isCurrent: yup.boolean().default(false),
                    date: yup.date().required("Funding date is required"),
                }),
            )
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
            .of(
                yup.object({
                    heading: yup.string().required("Heading is required"),
                    paragraph: yup.string().required("Paragraph is required"),
                }),
            )
            .min(1, "At least one overview section is required"),
        team: yup
            .array()
            .of(
                yup.object({
                    name: yup.string().required("Member name is required"),
                    avatarUrl: yup.string().url("Invalid avatar URL"),
                    role: yup.string().required("Member role is required"),
                }),
            )
            .min(1, "At least one team member is required"),
    }),
});

export const investorProfileSchema = yup.object({
    body: yup.object({
        investmentInterests: yup.array().of(yup.string()),
        investmentStages: yup.array().of(yup.string()),
        portfolioCompanies: yup.array().of(yup.string()),
        investmentRange: yup.object({
            minAmount: yup.number().min(0),
            maxAmount: yup.number().min(0),
        }),
        totalInvestments: yup.number().min(0),
        investmentCriteria: yup.array().of(yup.string()),
        location: yup.string(),
    }),
});
