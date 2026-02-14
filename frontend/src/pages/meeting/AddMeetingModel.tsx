import React from "react";
import { Video, Mic, MapPin } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { MeetingType } from "../../types";
import { useScheduleMeetingMutation } from "../../services/meeting.service";
import { useSelector } from "react-redux";
import { IAuthProps } from "../../features/auth.slice";

interface Props {
    open: boolean;
    onClose: () => void;
    connections: any[];
}

export const ScheduleMeetingModal: React.FC<Props> = ({
    open,
    onClose,
    connections,
}) => {
    const user = useSelector((state: { auth: IAuthProps }) => state.auth);
    const [draft, setDraft] = React.useState({
        attendeeId: "",
        title: "",
        agenda: "",
        startTime: "",
        durationMinutes: 30,
        meetingType: "video" as MeetingType,
        meetingLink: "",
        location: "",
    });

    const [schedule, { isLoading: loading }] = useScheduleMeetingMutation();

    if (!open) return null;

    const handleSchedule = async (e: React.FormEvent) => {
        e.preventDefault();

        await schedule({
            title: draft.title,
            agenda: draft.agenda,
            scheduledBy: user._id,
            attendeeId: draft.attendeeId,
            startTime: new Date(draft.startTime).toString(),
            durationMinutes: draft.durationMinutes,
            meetingType: draft.meetingType,
            meetingLink:
                draft.meetingType === "video" || draft.meetingType === "audio"
                    ? draft.meetingLink
                    : undefined,
            location:
                draft.meetingType === "in_person" ? draft.location : undefined,
        }).unwrap();

        setDraft({
            attendeeId: "",
            title: "",
            agenda: "",
            startTime: "",
            durationMinutes: 30,
            meetingType: "video",
            meetingLink: "",
            location: "",
        });

        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-bold mb-4">Schedule Meeting</h2>

                <form onSubmit={handleSchedule} className="space-y-4">
                    <select
                        title="attendeeId"
                        value={draft.attendeeId}
                        onChange={(e) =>
                            setDraft((p) => ({
                                ...p,
                                attendeeId: e.target.value,
                            }))
                        }
                        className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm"
                    >
                        <option value="">Select Attendee</option>
                        {connections.map((c) => (
                            <option key={c._id} value={c._id}>
                                {c.name}
                            </option>
                        ))}
                    </select>

                    <Input
                        placeholder="Meeting Title"
                        value={draft.title}
                        onChange={(e) =>
                            setDraft((p) => ({
                                ...p,
                                title: e.target.value,
                            }))
                        }
                    />

                    <Input
                        placeholder="Agenda"
                        value={draft.agenda}
                        onChange={(e) =>
                            setDraft((p) => ({
                                ...p,
                                agenda: e.target.value,
                            }))
                        }
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            type="datetime-local"
                            value={draft.startTime}
                            onChange={(e) =>
                                setDraft((p) => ({
                                    ...p,
                                    startTime: e.target.value,
                                }))
                            }
                        />
                        <div className="flex items-center justify-center gap-2">
                            <Input
                                type="number"
                                min={15}
                                step={15}
                                value={draft.durationMinutes}
                                onChange={(e) =>
                                    setDraft((p) => ({
                                        ...p,
                                        durationMinutes: Number(e.target.value),
                                    }))
                                }
                            />
                            <p className="text-xs">Minuts</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        {(["video", "audio", "in_person"] as MeetingType[]).map(
                            (type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() =>
                                        setDraft((p) => ({
                                            ...p,
                                            meetingType: type,
                                        }))
                                    }
                                    className={`p-2 rounded-lg border text-xs flex items-center justify-center gap-2 ${
                                        draft.meetingType === type
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-gray-200"
                                    }`}
                                >
                                    {type === "video" && <Video size={14} />}
                                    {type === "audio" && <Mic size={14} />}
                                    {type === "in_person" && (
                                        <MapPin size={14} />
                                    )}
                                    {type.replace("_", " ")}
                                </button>
                            ),
                        )}
                    </div>

                    {(draft.meetingType === "video" ||
                        draft.meetingType === "audio") && (
                        <Input
                            placeholder="Meeting Link"
                            value={draft.meetingLink}
                            onChange={(e) =>
                                setDraft((p) => ({
                                    ...p,
                                    meetingLink: e.target.value,
                                }))
                            }
                        />
                    )}

                    {draft.meetingType === "in_person" && (
                        <Input
                            placeholder="Location"
                            value={draft.location}
                            onChange={(e) =>
                                setDraft((p) => ({
                                    ...p,
                                    location: e.target.value,
                                }))
                            }
                        />
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={loading}>
                            Schedule
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
