import { useCallback, useEffect, useRef, useState } from "react";
import { socket } from "../socket";
import { IAuthProps } from "../features/auth.slice";
import {
    playCallConnectedSound,
    playCallEndedSound,
    startCallTone,
    stopCallTone,
} from "../utils/sound";

export type CallType = "audio" | "video";

export interface CallPeer {
    _id: string;
    name: string;
    avatarUrl?: string;
}

export type CallStatus =
    | "idle"
    | "calling"
    | "ringing"
    | "connecting"
    | "in-call";

export interface CallState {
    status: CallStatus;
    type: CallType | null;
    peer: CallPeer | null;
    callId: string | null;
    isMuted: boolean;
    isCameraOff: boolean;
}

const initialCallState: CallState = {
    status: "idle",
    type: null,
    peer: null,
    callId: null,
    isMuted: false,
    isCameraOff: false,
};

const ICE_SERVERS: RTCIceServer[] = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
];

const createCallId = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

interface UseCallOptions {
    currentUser: IAuthProps;
    resolvePeer?: (id: string) => CallPeer | null;
}

interface CallOfferPayload {
    callId: string;
    type: CallType;
    sdp: RTCSessionDescriptionInit;
    from?: CallPeer;
    fromId?: string;
}

interface CallAnswerPayload {
    callId: string;
    sdp: RTCSessionDescriptionInit;
}

interface CallIcePayload {
    callId: string;
    candidate: RTCIceCandidateInit;
}

interface CallSignalPayload {
    callId: string;
}

export const useCall = ({ currentUser, resolvePeer }: UseCallOptions) => {
    const [callState, setCallState] = useState<CallState>(initialCallState);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const pendingOfferRef = useRef<RTCSessionDescriptionInit | null>(null);
    const callStateRef = useRef<CallState>(initialCallState);
    const localStreamRef = useRef<MediaStream | null>(null);
    const previousStatusRef = useRef<CallStatus>("idle");

    useEffect(() => {
        callStateRef.current = callState;
    }, [callState]);

    useEffect(() => {
        const previousStatus = previousStatusRef.current;
        const isRinging =
            callState.status === "ringing" || callState.status === "calling";

        if (isRinging && callState.type) {
            startCallTone(callState.type);
        } else {
            stopCallTone();
        }

        if (
            callState.status === "in-call" &&
            previousStatus !== "in-call" &&
            callState.type
        ) {
            playCallConnectedSound(callState.type);
        }

        if (callState.status === "idle" && previousStatus !== "idle") {
            playCallEndedSound();
        }

        previousStatusRef.current = callState.status;
    }, [callState.status, callState.type]);

    const stopLocalTracks = useCallback(() => {
        if (!localStreamRef.current) return;
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
    }, []);

    const cleanup = useCallback(() => {
        pendingOfferRef.current = null;

        if (peerConnectionRef.current) {
            peerConnectionRef.current.ontrack = null;
            peerConnectionRef.current.onicecandidate = null;
            peerConnectionRef.current.onconnectionstatechange = null;
            peerConnectionRef.current.close();
        }

        peerConnectionRef.current = null;
        stopLocalTracks();
        setLocalStream(null);
        setRemoteStream(null);
        callStateRef.current = initialCallState;
        setCallState(initialCallState);
    }, [stopLocalTracks]);

    const createPeerConnection = useCallback(
        (peerId: string, callId: string) => {
            const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

            pc.onicecandidate = (event) => {
                if (!event.candidate) return;
                if (!socket.connected) socket.connect();
                socket.emit("call:ice", {
                    to: peerId,
                    callId,
                    candidate: event.candidate,
                });
            };

            pc.ontrack = (event) => {
                const [stream] = event.streams;
                if (stream) {
                    setRemoteStream(stream);
                    return;
                }

                setRemoteStream((prev) => {
                    const nextStream = prev || new MediaStream();
                    nextStream.addTrack(event.track);
                    return nextStream;
                });
            };

            pc.onconnectionstatechange = () => {
                if (pc.connectionState === "connected") {
                    setCallState((prev) =>
                        prev.status === "connecting"
                            ? { ...prev, status: "in-call" }
                            : prev,
                    );
                }

                if (
                    pc.connectionState === "disconnected" ||
                    pc.connectionState === "failed" ||
                    pc.connectionState === "closed"
                ) {
                    cleanup();
                }
            };

            peerConnectionRef.current = pc;
            return pc;
        },
        [cleanup],
    );

    const startCall = useCallback(
        async (peer: CallPeer, type: CallType) => {
            if (!currentUser?._id) return;
            if (callStateRef.current.status !== "idle") return;

            const callId = createCallId();
            const nextState: CallState = {
                status: "calling",
                type,
                peer,
                callId,
                isMuted: false,
                isCameraOff: type === "audio",
            };

            callStateRef.current = nextState;
            setCallState(nextState);

            if (!socket.connected) socket.connect();

            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: type === "video",
                });

                localStreamRef.current = stream;
                setLocalStream(stream);

                const pc = createPeerConnection(peer._id, callId);
                stream.getTracks().forEach((track) =>
                    pc.addTrack(track, stream),
                );

                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);

                socket.emit("call:offer", {
                    to: peer._id,
                    callId,
                    type,
                    sdp: offer,
                    from: {
                        _id: currentUser._id,
                        name: currentUser.name,
                        avatarUrl: currentUser.avatarUrl,
                    },
                });
            } catch (error) {
                console.error("Failed to start call", error);
                cleanup();
            }
        },
        [cleanup, createPeerConnection, currentUser],
    );

    const acceptCall = useCallback(async () => {
        const { peer, callId, type, status } = callStateRef.current;
        const offer = pendingOfferRef.current;

        if (!peer || !callId || !type || status !== "ringing" || !offer) {
            return;
        }

        setCallState((prev) => ({ ...prev, status: "connecting" }));

        if (!socket.connected) socket.connect();

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: type === "video",
            });

            localStreamRef.current = stream;
            setLocalStream(stream);

            const pc = createPeerConnection(peer._id, callId);
            stream.getTracks().forEach((track) =>
                pc.addTrack(track, stream),
            );

            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            pendingOfferRef.current = null;

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            socket.emit("call:answer", {
                to: peer._id,
                callId,
                sdp: answer,
            });
        } catch (error) {
            console.error("Failed to accept call", error);
            socket.emit("call:reject", { to: peer._id, callId });
            cleanup();
        }
    }, [cleanup, createPeerConnection]);

    const rejectCall = useCallback(() => {
        const { peer, callId, status } = callStateRef.current;
        if (!peer || !callId || status !== "ringing") return;

        if (!socket.connected) socket.connect();
        socket.emit("call:reject", { to: peer._id, callId });
        cleanup();
    }, [cleanup]);

    const hangupCall = useCallback(() => {
        const { peer, callId, status } = callStateRef.current;
        if (!peer || !callId || status === "idle") {
            cleanup();
            return;
        }

        if (!socket.connected) socket.connect();
        socket.emit("call:hangup", { to: peer._id, callId });
        cleanup();
    }, [cleanup]);

    const toggleMute = useCallback(() => {
        const stream = localStreamRef.current;
        if (!stream) return;
        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length === 0) return;

        const nextEnabled = !audioTracks[0].enabled;
        audioTracks.forEach((track) => {
            track.enabled = nextEnabled;
        });

        setCallState((prev) => ({ ...prev, isMuted: !nextEnabled }));
    }, []);

    const toggleCamera = useCallback(() => {
        const stream = localStreamRef.current;
        if (!stream) return;
        const videoTracks = stream.getVideoTracks();
        if (videoTracks.length === 0) return;

        const nextEnabled = !videoTracks[0].enabled;
        videoTracks.forEach((track) => {
            track.enabled = nextEnabled;
        });

        setCallState((prev) => ({
            ...prev,
            isCameraOff: !nextEnabled,
        }));
    }, []);

    useEffect(() => {
        if (!currentUser?._id) return;

        const handleOffer = (payload: CallOfferPayload) => {
            if (callStateRef.current.status !== "idle") {
                const fromId = payload.from?._id || payload.fromId;
                if (fromId) {
                    socket.emit("call:busy", {
                        to: fromId,
                        callId: payload.callId,
                    });
                }
                return;
            }

            const fromId = payload.from?._id || payload.fromId;
            if (!fromId) return;

            const resolvedPeer =
                payload.from || resolvePeer?.(fromId) || {
                    _id: fromId,
                    name: "Unknown",
                };

            pendingOfferRef.current = payload.sdp;

            const nextState: CallState = {
                status: "ringing",
                type: payload.type,
                peer: resolvedPeer,
                callId: payload.callId,
                isMuted: false,
                isCameraOff: payload.type === "audio",
            };

            callStateRef.current = nextState;
            setCallState(nextState);
        };

        const handleAnswer = async (payload: CallAnswerPayload) => {
            if (callStateRef.current.callId !== payload.callId) return;
            const pc = peerConnectionRef.current;
            if (!pc) return;

            try {
                await pc.setRemoteDescription(
                    new RTCSessionDescription(payload.sdp),
                );
                setCallState((prev) => ({
                    ...prev,
                    status: "connecting",
                }));
            } catch (error) {
                console.error("Failed to handle answer", error);
                cleanup();
            }
        };

        const handleIce = async (payload: CallIcePayload) => {
            if (callStateRef.current.callId !== payload.callId) return;
            const pc = peerConnectionRef.current;
            if (!pc) return;

            try {
                await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
            } catch (error) {
                console.error("Failed to add ICE candidate", error);
            }
        };

        const handleReject = (payload: CallSignalPayload) => {
            if (callStateRef.current.callId !== payload.callId) return;
            cleanup();
        };

        const handleHangup = (payload: CallSignalPayload) => {
            if (callStateRef.current.callId !== payload.callId) return;
            cleanup();
        };

        const handleBusy = (payload: CallSignalPayload) => {
            if (callStateRef.current.callId !== payload.callId) return;
            cleanup();
        };

        socket.on("call:offer", handleOffer);
        socket.on("call:answer", handleAnswer);
        socket.on("call:ice", handleIce);
        socket.on("call:reject", handleReject);
        socket.on("call:hangup", handleHangup);
        socket.on("call:busy", handleBusy);

        return () => {
            socket.off("call:offer", handleOffer);
            socket.off("call:answer", handleAnswer);
            socket.off("call:ice", handleIce);
            socket.off("call:reject", handleReject);
            socket.off("call:hangup", handleHangup);
            socket.off("call:busy", handleBusy);
        };
    }, [cleanup, currentUser?._id, resolvePeer]);

    useEffect(() => {
        return () => {
            stopCallTone();
            cleanup();
        };
    }, [cleanup]);

    return {
        callState,
        localStream,
        remoteStream,
        startCall,
        acceptCall,
        rejectCall,
        hangupCall,
        toggleMute,
        toggleCamera,
    };
};
