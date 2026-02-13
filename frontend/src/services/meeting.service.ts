import { apiSlice } from "./apiSlice";
import { Meeting, MeetingStatus, MeetingType } from "../types";

interface MeetingsResponse {
    success: boolean;
    count: number;
    meetings: Meeting[];
}

interface MeetingResponse {
    success: boolean;
    message: string;
    data: Meeting;
}

export interface ScheduleMeetingPayload {
    attendeeId: string;
    title: string;
    agenda?: string;
    startTime: string;
    durationMinutes: number;
    meetingType: MeetingType;
    meetingLink?: string;
    location?: string;
    relatedDealId?: string;
}

export interface RescheduleMeetingPayload {
    meetingId: string;
    startTime?: string;
    durationMinutes?: number;
    meetingLink?: string;
    location?: string;
}

export const meetingApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        scheduleMeeting: builder.mutation<MeetingResponse, ScheduleMeetingPayload>(
            {
                query: (meetingData) => ({
                    url: "/meeting/schedule",
                    method: "POST",
                    body: meetingData,
                }),
                invalidatesTags: [{ type: "Meeting", id: "LIST" }],
            },
        ),
        getMyMeetings: builder.query<
            MeetingsResponse,
            { status?: MeetingStatus } | void
        >({
            query: (params) => {
                const queryParams = new URLSearchParams();
                if (params?.status) {
                    queryParams.set("status", params.status);
                }

                const querySuffix = queryParams.toString();
                return {
                    url: `/meeting/my-meetings${querySuffix ? `?${querySuffix}` : ""}`,
                    method: "GET",
                };
            },
            providesTags: (result) =>
                result
                    ? [
                          ...result.meetings.map((meeting) => ({
                              type: "Meeting" as const,
                              id: meeting._id,
                          })),
                          { type: "Meeting", id: "LIST" },
                      ]
                    : [{ type: "Meeting", id: "LIST" }],
        }),
        updateMeetingStatus: builder.mutation<
            MeetingResponse,
            { meetingId: string; status: MeetingStatus }
        >({
            query: (payload) => ({
                url: "/meeting/status",
                method: "PUT",
                body: payload,
            }),
            invalidatesTags: (_result, _error, payload) => [
                { type: "Meeting", id: payload.meetingId },
                { type: "Meeting", id: "LIST" },
            ],
        }),
        rescheduleMeeting: builder.mutation<
            MeetingResponse,
            RescheduleMeetingPayload
        >({
            query: (payload) => ({
                url: "/meeting/reschedule",
                method: "PUT",
                body: payload,
            }),
            invalidatesTags: (_result, _error, payload) => [
                { type: "Meeting", id: payload.meetingId },
                { type: "Meeting", id: "LIST" },
            ],
        }),
    }),
});

export const {
    useGetMyMeetingsQuery,
    useRescheduleMeetingMutation,
    useScheduleMeetingMutation,
    useUpdateMeetingStatusMutation,
} = meetingApi;
