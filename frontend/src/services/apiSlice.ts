// src/store/api/apiSlice.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const apiSlice = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({
        baseUrl: BACKEND_URL || "",
        credentials: "include",
        prepareHeaders: (headers) => {
            headers.set("Accept", "application/json");
            return headers;
        },
    }),
    tagTypes: [
        "User",
        "Notification",
        "Requests",
        "Message",
        "Document",
        "Deal",
        "Meeting",
        "Payment",
    ],
    endpoints: () => ({}),
});
