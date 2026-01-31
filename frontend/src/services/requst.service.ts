import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import { createApi } from "@reduxjs/toolkit/query/react";

export const requestApi = createApi({
    reducerPath: "requestApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:3000/api/request",
        credentials: "include",
    }),
    endpoints: (builder) => ({
        createRequest: builder.mutation({
            query: (requestData) => ({
                url: "/create",
                method: "POST",
                body: requestData,
            }),
        }),
        getAllUserRequests: builder.query({
            query: () => ({
                url: "/user-requests",
                method: "GET",
            }),
        }),
    }),
});

export const { useCreateRequestMutation, useGetAllUserRequestsQuery } =
    requestApi;
