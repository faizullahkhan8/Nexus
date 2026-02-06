import { apiSlice } from "./apiSlice";

export const messageApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createMessage: builder.mutation({
            query: (messageData) => ({
                url: "/message/create",
                method: "POST",
                body: messageData,
            }),
            invalidatesTags: [{ type: "Message", id: "LIST" }],
        }),
        getMessagesBetweenUsers: builder.query({
            query: (userId: string) => ({
                url: `/message/between/${userId}`,
                method: "GET",
            }),
            providesTags: (result) =>
                result?.data
                    ? [
                          ...result.data.map(({ _id }: any) => ({
                              type: "Message" as const,
                              id: _id,
                          })),
                          { type: "Message", id: "LIST" },
                      ]
                    : [{ type: "Message", id: "LIST" }],
        }),
        getMessageById: builder.query({
            query: (messageId: string) => ({
                url: `/message/${messageId}`,
                method: "GET",
            }),
            providesTags: (_, __, id) => [{ type: "Message", id }],
        }),
        markMessageRead: builder.mutation({
            query: (messageId: string) => ({
                url: `/message/read/${messageId}`,
                method: "PUT",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "Message", id },
                { type: "Message", id: "LIST" },
            ],
        }),
        deleteMessage: builder.mutation({
            query: (messageId: string) => ({
                url: `/message/${messageId}`,
                method: "DELETE",
            }),
            invalidatesTags: [{ type: "Message", id: "LIST" }],
        }),
    }),
});

export const {
    useCreateMessageMutation,
    useGetMessagesBetweenUsersQuery,
    useGetMessageByIdQuery,
    useMarkMessageReadMutation,
    useDeleteMessageMutation,
} = messageApi;
