import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { CheckCircle, XCircle } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";

import { IAuthProps } from "../../features/auth.slice";
import { CollaborationRequest } from "../../types";
import {
    useGetMyMeetingsQuery,
    useUpdateMeetingStatusMutation,
} from "../../services/meeting.service";
import { useGetAllUserRequestsQuery } from "../../services/requst.service";
import { ScheduleMeetingModal } from "./AddMeetingModel";

export const MeetingsManager: React.FC = () => {
    const user = useSelector((state: { auth: IAuthProps }) => state.auth);
    const [isAddModelOpen, setIsAddModelOpen] = useState<boolean>(false);

    const { data: meetingsData } = useGetMyMeetingsQuery();
    const { data: requestsData } = useGetAllUserRequestsQuery({});

    const [updateStatus] = useUpdateMeetingStatusMutation();

    const connections = useMemo(() => {
        if (!user?._id || !requestsData?.requests) return [];
        return (requestsData.requests as CollaborationRequest[])
            .filter((r) => r.status === "accepted")
            .map((r) =>
                r.senderId._id === user._id ? r.receiverId : r.senderId,
            );
    }, [requestsData?.requests, user?._id]);

    const meetings = meetingsData?.meetings || [];

    if (!user?._id) return null;

    return (
        <div className="flex flex-col w-full gap-4">
            <ScheduleMeetingModal
                onClose={() => setIsAddModelOpen(false)}
                connections={connections}
                open={isAddModelOpen}
                initialAttendeeId={user._id}
            />

            {/* Meetings List */}
            <Card className="lg:col-span-2">
                <CardHeader className="flex justify-between items-center">
                    <h2 className="text-lg font-bold">My Meetings</h2>
                    <Button onClick={() => setIsAddModelOpen(true)}>
                        Add Meeting
                    </Button>
                </CardHeader>
                <CardBody>
                    <div className="space-y-4">
                        {meetings.map((m: any) => {
                            const other =
                                m.scheduledBy._id === user._id
                                    ? m.attendeeId
                                    : m.scheduledBy;

                            return (
                                <div
                                    key={m._id}
                                    className="p-4 border rounded-xl flex items-center justify-between"
                                >
                                    <div>
                                        <p className="font-semibold">
                                            {m.title}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(
                                                m.startTime,
                                            ).toLocaleString()}{" "}
                                            • {other.name}
                                        </p>
                                    </div>

                                    {m.status === "scheduled" ? (
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() =>
                                                    updateStatus({
                                                        meetingId: m._id,
                                                        status: "completed",
                                                    })
                                                }
                                            >
                                                <CheckCircle size={16} />
                                            </Button>
                                            <Button
                                                onClick={() =>
                                                    updateStatus({
                                                        meetingId: m._id,
                                                        status: "cancelled",
                                                    })
                                                }
                                            >
                                                <XCircle size={16} />
                                            </Button>
                                        </div>
                                    ) : (
                                        <Badge
                                            variant={
                                                m.status === "completed"
                                                    ? "success"
                                                    : "error"
                                            }
                                        >
                                            {m.status}
                                        </Badge>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};
