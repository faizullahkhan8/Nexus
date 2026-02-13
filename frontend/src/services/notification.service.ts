import { apiSlice } from "./apiSlice";
import { Notification } from "../types";

interface NotificationsResponse {
    success: boolean;
    unreadCount: number;
    data: Notification[];
}

interface MarkNotificationReadResponse {
    success: boolean;
    data: Notification;
}

interface MarkAllNotificationsReadResponse {
    success: boolean;
    message: string;
}

export const notificationApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAllNotifications: builder.query<NotificationsResponse, void>({
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

        markNotificationRead: builder.mutation<
            MarkNotificationReadResponse,
            string
        >({
            query: (notificationId) => ({
                url: `/notification/${notificationId}/read`,
                method: "PUT",
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: "Notification", id },
            ],
        }),

        markNotificationAsAllRead: builder.mutation<
            MarkAllNotificationsReadResponse,
            void
        >({
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
