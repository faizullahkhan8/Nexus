import { apiSlice } from "./apiSlice";

export const authApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (credentials) => ({
                url: "/auth/login",
                method: "POST",
                body: credentials,
            }),
            invalidatesTags: ["User", "Notification", "Requests"],
        }),
        signup: builder.mutation({
            query: (userData) => ({
                url: "/auth/signup",
                method: "POST",
                body: userData,
            }),
            invalidatesTags: ["User"],
        }),
        logout: builder.mutation({
            query: () => ({
                url: "/auth/logout",
                method: "POST",
            }),
            onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
                await queryFulfilled;
                dispatch(apiSlice.util.resetApiState());
            },
        }),
        getMe: builder.query({
            query: () => ({
                url: "/auth/get-me",
                method: "GET",
            }),
            providesTags: ["User"],
        }),
        getEntrepreneurById: builder.query({
            query: (id: string) => ({
                url: `/auth/entrepreneur/get/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "User", id }],
        }),
        getAllEntrepreneurs: builder.query({
            query: () => ({
                url: `/auth/entrepreneur/get-all`,
                method: "GET",
            }),
            providesTags: (result) =>
                result
                    ? [
                          ...result.entrepreneurs.map(({ _id }: any) => ({
                              type: "User" as const,
                              id: _id,
                          })),
                          { type: "User", id: "ENTREPRENEUR_LIST" },
                      ]
                    : [{ type: "User", id: "ENTREPRENEUR_LIST" }],
        }),
        updateEntrepreneur: builder.mutation({
            query: (updateData) => ({
                url: `/auth/entrepreneur/profile/update`,
                method: "PUT",
                body: updateData,
            }),
            invalidatesTags: (result, error, arg) => [
                "User",
                { type: "User", id: "ENTREPRENEUR_LIST" },
            ],
        }),
        getInvestorById: builder.query({
            query: (id: string) => ({
                url: `/auth/investor/get/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "User", id }],
        }),
        updateInvestor: builder.mutation({
            query: (updateData) => ({
                url: `/auth/investor/profile/update`,
                method: "PUT",
                body: updateData,
            }),
            invalidatesTags: ["User", { type: "User", id: "INVESTOR_LIST" }],
        }),
        getAllInvestor: builder.query({
            query: () => ({
                url: "/auth/investor/get-all",
                method: "GET",
            }),
            providesTags: (result) => {
                return result
                    ? [
                          ...result.investors.map(({ _id }: any) => ({
                              type: "User" as const,
                              id: _id,
                          })),
                          { type: "User", id: "INVESTOR_LIST" },
                      ]
                    : [{ type: "User", id: "INVESTOR_LIST" }];
            },
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
    useGetInvestorByIdQuery,
    useUpdateInvestorMutation,
    useGetAllEntrepreneursQuery,
    useGetAllInvestorQuery,
} = authApi;
