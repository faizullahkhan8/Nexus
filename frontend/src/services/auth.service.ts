import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:3000/api/auth",
        credentials: "include",
        // This ensures cookies (sessions) are sent with every request
        prepareHeaders: (headers) => {
            headers.set("Accept", "application/json");
            return headers;
        },
    }),
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (credentials) => ({
                url: "/login",
                method: "POST",
                body: credentials,
            }),
        }),
        signup: builder.mutation({
            query: (userData) => ({
                url: "/signup",
                method: "POST",
                body: userData,
            }),
        }),
        logout: builder.mutation({
            query: () => ({
                url: "/logout",
                method: "POST",
            }),
        }),
        getMe: builder.query({
            query: () => ({
                url: "/get-me",
                method: "GET",
            }),
        }),
        getEntrepreneurById: builder.query({
            query: (id: string) => ({
                url: `/entrepreneur/get/${id}`,
                method: "GET",
            }),
        }),
        updateEntrepreneur: builder.mutation({
            query: (updateData) => ({
                url: `/entrepreneur/profile/update`,
                method: "PUT",
                body: updateData,
            }),
        }),
    }),
});

export const {
    useLoginMutation,
    useSignupMutation,
    useLogoutMutation,
    useGetMeQuery,
    useGetEntrepreneurByIdQuery,
    useUpdateEntrepreneurMutation,
} = authApi;
