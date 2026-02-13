import React, { useEffect, useMemo, useRef } from "react";
import { Mic, MicOff, Phone, PhoneOff, Video, VideoOff } from "lucide-react";
import { Button } from "../ui/Button";
import { Avatar } from "../ui/Avatar";
import { CallState } from "../../hooks/useCall";

interface CallOverlayProps {
    callState: CallState;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    onAccept: () => void;
    onReject: () => void;
    onHangup: () => void;
    onToggleMute: () => void;
    onToggleCamera: () => void;
}

const getInitials = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return "U";
    const parts = trimmed.split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

export const CallOverlay: React.FC<CallOverlayProps> = ({
    callState,
    localStream,
    remoteStream,
    onAccept,
    onReject,
    onHangup,
    onToggleMute,
    onToggleCamera,
}) => {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const remoteAudioRef = useRef<HTMLAudioElement>(null);

    const isVideo = callState.type === "video";

    const peerName = callState.peer?.name || "Unknown caller";
    const peerAvatar = useMemo(() => {
        if (callState.peer?.avatarUrl) return callState.peer.avatarUrl;
        const initials = getInitials(peerName);
        return `https://dummyjson.com/image/150x150/008080/ffffff?text=${initials}`;
    }, [callState.peer?.avatarUrl, peerName]);

    const statusLabel = useMemo(() => {
        switch (callState.status) {
            case "calling":
                return "Calling...";
            case "ringing":
                return "Incoming call";
            case "connecting":
                return "Connecting...";
            case "in-call":
                return "In call";
            default:
                return "";
        }
    }, [callState.status]);

    useEffect(() => {
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
        if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    if (callState.status === "idle") return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-gray-900 text-white rounded-2xl overflow-hidden shadow-2xl">
                <div className="relative h-[70vh] bg-black flex items-center justify-center">
                    {isVideo ? (
                        <>
                            {remoteStream ? (
                                <video
                                    ref={remoteVideoRef}
                                    autoPlay
                                    playsInline
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center gap-4">
                                    <Avatar
                                        src={peerAvatar}
                                        alt={peerName}
                                        size="xl"
                                    />
                                    <p className="text-lg text-gray-200">
                                        {peerName}
                                    </p>
                                </div>
                            )}

                            {localStream && (
                                <video
                                    ref={localVideoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    className="absolute bottom-4 right-4 w-40 h-28 bg-black/80 rounded-xl object-cover border border-white/20"
                                />
                            )}
                        </>
                    ) : (
                        <>
                            <div className="flex flex-col items-center justify-center gap-4">
                                <Avatar
                                    src={peerAvatar}
                                    alt={peerName}
                                    size="xl"
                                />
                                <div className="text-center">
                                    <p className="text-lg font-semibold">
                                        {peerName}
                                    </p>
                                    <p className="text-sm text-gray-300">
                                        {statusLabel}
                                    </p>
                                </div>
                            </div>
                            <audio ref={remoteAudioRef} autoPlay />
                        </>
                    )}

                    <div className="absolute top-4 left-4">
                        <p className="text-sm text-gray-300">{statusLabel}</p>
                        <p className="text-lg font-semibold">{peerName}</p>
                        {callState.type && (
                            <p className="text-xs text-gray-400 uppercase mt-1">
                                {callState.type} call
                            </p>
                        )}
                    </div>
                </div>

                <div className="p-4 flex items-center justify-center gap-3 bg-gray-900/90">
                    {callState.status === "ringing" && (
                        <>
                            <Button
                                variant="success"
                                size="sm"
                                onClick={onAccept}
                                leftIcon={<Phone size={16} />}
                            >
                                Accept
                            </Button>
                            <Button
                                variant="error"
                                size="sm"
                                onClick={onReject}
                                leftIcon={<PhoneOff size={16} />}
                            >
                                Decline
                            </Button>
                        </>
                    )}

                    {callState.status === "calling" && (
                        <Button
                            variant="error"
                            size="sm"
                            onClick={onHangup}
                            leftIcon={<PhoneOff size={16} />}
                        >
                            Cancel
                        </Button>
                    )}

                    {(callState.status === "connecting" ||
                        callState.status === "in-call") && (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onToggleMute}
                                className="text-white hover:bg-white/10"
                                leftIcon={
                                    callState.isMuted ? (
                                        <MicOff size={16} />
                                    ) : (
                                        <Mic size={16} />
                                    )
                                }
                            >
                                {callState.isMuted ? "Unmute" : "Mute"}
                            </Button>

                            {isVideo && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onToggleCamera}
                                    className="text-white hover:bg-white/10"
                                    leftIcon={
                                        callState.isCameraOff ? (
                                            <VideoOff size={16} />
                                        ) : (
                                            <Video size={16} />
                                        )
                                    }
                                >
                                    {callState.isCameraOff
                                        ? "Camera on"
                                        : "Camera off"}
                                </Button>
                            )}

                            <Button
                                variant="error"
                                size="sm"
                                onClick={onHangup}
                                leftIcon={<PhoneOff size={16} />}
                            >
                                End
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
