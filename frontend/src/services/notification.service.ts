import { apiSlice } from "./apiSlice";

export const notificationApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAllNotifications: builder.query({
            query: () => ({
                url: "/notification/get-all",
                method: "GET",
            }),
            providesTags: (result) =>
                result?.data
                    ? [
                          ...result.data.map(({ _id }: any) => ({
                              type: "Notification" as const,
                              id: _id,
                          })),
                          { type: "Notification", id: "LIST" },
                      ]
                    : [{ type: "Notification", id: "LIST" }],
        }),

        markNotificationRead: builder.mutation({
            query: (notificationId) => ({
                url: `/notification/${notificationId}/read`,
                method: "PUT",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "Notification", id },
            ],
        }),

        markNotificationAsAllRead: builder.mutation({
            query: () => ({
                url: "/notification/read-all",
                method: "PUT",
            }),
            invalidatesTags: [{ type: "Notification", id: "LIST" }],
        }),
    }),
});

export const {
    useGetAllNotificationsQuery,
    useMarkNotificationAsAllReadMutation,
    useMarkNotificationReadMutation,
} = notificationApi;
