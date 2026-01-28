// utils/authValidation.ts
import * as yup from "yup";

export const signupSchema = yup.object({
    body: yup.object({
        name: yup.string().required("Name is required"),
        email: yup
            .string()
            .email("Invalid email format")
            .required("Email is required"),
        password: yup
            .string()
            .min(6, "Password must be at least 6 chars")
            .required("Password is required"),
        role: yup
            .string()
            .oneOf(["entrepreneur", "investor"], "Invalid role")
            .required("Role is required"),
    }),
});

export const loginSchema = yup.object({
    body: yup.object({
        email: yup
            .string()
            .email("Invalid email")
            .required("Email is required"),
        password: yup.string().required("Password is required"),
    }),
});
