import { apiSlice } from "./apiSlice";

export const requestApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createRequest: builder.mutation({
            query: (requestData) => ({
                url: "/request/create",
                method: "POST",
                body: requestData,
            }),
            invalidatesTags: [{ type: "Requests", id: "LIST" }],
        }),
        getAllUserRequests: builder.query({
            query: () => ({
                url: "/request/user-requests",
                method: "GET",
            }),
            providesTags: (result) =>
                result
                    ? [
                          ...result.requests.map(({ _id }: any) => ({
                              type: "Requests" as const,
                              id: _id,
                          })),
                          { type: "Requests", id: "LIST" },
                      ]
                    : [{ type: "Requests", id: "LIST" }],
        }),
        updateUserRequest: builder.mutation({
            query: ({ requestId, status }) => ({
                url: "/request/update",
                method: "PUT",
                body: { requestId, status },
            }),
            invalidatesTags: (result, error, { requestId }) => [
                { type: "Requests", id: requestId },
                { type: "Requests", id: "LIST" },
            ],
        }),
    }),
});

export const {
    useCreateRequestMutation,
    useGetAllUserRequestsQuery,
    useUpdateUserRequestMutation,
} = requestApi;
