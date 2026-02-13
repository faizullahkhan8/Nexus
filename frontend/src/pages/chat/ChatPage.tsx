import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Send, Phone, Video, Info, Smile } from "lucide-react";
import { Avatar } from "../../components/ui/Avatar";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { ChatMessage } from "../../components/chat/ChatMessage";
import { ChatUserList } from "../../components/chat/ChatUserList";
import { Message, User } from "../../types";
import { MessageCircle } from "lucide-react";
import { useSelector } from "react-redux";
import { IAuthProps } from "../../features/auth.slice";
import {
    useCreateMessageMutation,
    useGetMessagesBetweenUsersQuery,
} from "../../services/message.service";
import { useGetAllUserRequestsQuery } from "../../services/requst.service";
import { socket } from "../../socket";
import { useCall } from "../../hooks/useCall";
import { CallOverlay } from "../../components/calls/CallOverlay";

export const ChatPage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const currentUser = useSelector(
        (state: { auth: IAuthProps }) => state.auth,
    );
    const [newMessage, setNewMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const { data: requestsData } = useGetAllUserRequestsQuery({});
    const { data: messagesData } = useGetMessagesBetweenUsersQuery(userId!, {
        skip: !userId,
    });
    const [createMessage, { isLoading: isSending }] =
        useCreateMessageMutation();

    const conversations = useMemo(() => {
        if (!requestsData?.requests?.length || !currentUser?._id) {
            return [];
        }

        return requestsData.requests
            .filter((req: any) => req.status === "accepted")
            .map((req: any) => {
                const isSender = req.senderId._id === currentUser._id;
                const otherUser = isSender ? req.receiverId : req.senderId;

                return {
                    id: req._id,
                    otherUser,
                    lastMessage: undefined,
                    updatedAt: req.createdAt?.toString() || "",
                };
            });
    }, [requestsData, currentUser]);

    useEffect(() => {
        if (!messagesData?.data?.length) return;

        setMessages(
            messagesData.data.map((message: any) => ({
                _id: message._id,
                id: message._id,
                senderId: message.senderId,
                receiverId: message.receiverId,
                content: message.content,
                timestamp: message.createdAt,
                createdAt: message.createdAt,
                isRead: message.isRead,
            }))
        );
    }, [messagesData]);

    const chatPartner: User | null = useMemo(() => {
        if (!userId || !currentUser?._id) return null;

        const fromConversation = conversations.find(
            (conv: any) => conv.otherUser._id === userId,
        )?.otherUser as User | undefined;

        if (fromConversation) return fromConversation;

        const firstMessage = messages[0];
        if (!firstMessage) return null;

        const sender =
            typeof firstMessage.senderId === "string"
                ? null
                : (firstMessage.senderId as User);
        const receiver =
            typeof firstMessage.receiverId === "string"
                ? null
                : (firstMessage.receiverId as User);

        if (sender && sender._id !== currentUser._id) return sender;
        if (receiver && receiver._id !== currentUser._id) return receiver;

        return null;
    }, [userId, currentUser, conversations, messages]);

    const resolvePeer = useCallback(
        (id: string) => {
            return (
                conversations.find((conv: any) => conv.otherUser._id === id)
                    ?.otherUser || null
            );
        },
        [conversations],
    );

    const {
        callState,
        localStream,
        remoteStream,
        startCall,
        acceptCall,
        rejectCall,
        hangupCall,
        toggleMute,
        toggleCamera,
    } = useCall({ currentUser, resolvePeer });

    const isCallBusy = callState.status !== "idle";

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newMessage.trim() || !currentUser?._id || !userId) return;

        await createMessage({
            receiverId: userId,
            content: newMessage.trim(),
        }).unwrap();

        setNewMessage("");
    };

    useEffect(() => {
        if (!currentUser?._id) return;

        const handleNewMessage = (message: Message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        };

        socket.on("new_message", handleNewMessage);

        return () => {
            socket.off("new_message", handleNewMessage);
        };
    }, [currentUser?._id]);

    if (!currentUser?._id) return null;

    return (
        <>
            <div className="flex h-[calc(100vh-4rem)] bg-white border border-gray-200 rounded-lg overflow-hidden animate-fade-in">
                {/* Conversations sidebar */}
                <div className="hidden md:block w-1/3 lg:w-1/4 border-r border-gray-200">
                    <ChatUserList conversations={conversations} />
                </div>

                {/* Main chat area */}
                <div className="flex-1 flex flex-col">
                    {/* Chat header */}
                    {chatPartner ? (
                        <>
                            <div className="border-b border-gray-200 p-4 flex justify-between items-center">
                                <div className="flex items-center">
                                    <Avatar
                                        src={
                                            chatPartner.avatarUrl ||
                                            `https://dummyjson.com/image/150x150/008080/ffffff?text=${chatPartner.name.split(" ")[0][0]}+${chatPartner.name.split(" ")[chatPartner.name.split(" ").length - 1][0]}`
                                        }
                                        alt={chatPartner.name}
                                        size="md"
                                        status={
                                            chatPartner.isOnline
                                                ? "online"
                                                : "offline"
                                        }
                                        className="mr-3"
                                    />

                                    <div>
                                        <h2 className="text-lg font-medium text-gray-900">
                                            {chatPartner.name}
                                        </h2>
                                        <p className="text-sm text-gray-500">
                                            {chatPartner.isOnline
                                                ? "Online"
                                                : "Last seen recently"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex space-x-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="rounded-full p-2"
                                        aria-label="Voice call"
                                        disabled={isCallBusy}
                                        onClick={() => {
                                            if (!chatPartner) return;
                                            startCall(chatPartner, "audio");
                                        }}
                                    >
                                        <Phone size={18} />
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="rounded-full p-2"
                                        aria-label="Video call"
                                        disabled={isCallBusy}
                                        onClick={() => {
                                            if (!chatPartner) return;
                                            startCall(chatPartner, "video");
                                        }}
                                    >
                                        <Video size={18} />
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="rounded-full p-2"
                                        aria-label="Info"
                                    >
                                        <Info size={18} />
                                    </Button>
                                </div>
                            </div>

                            {/* Messages container */}
                            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                                {messages.length > 0 ? (
                                    <div className="space-y-4">
                                        {messages.map((message) => {
                                            const sender =
                                                typeof message.senderId ===
                                                "string"
                                                    ? message.senderId ===
                                                        currentUser._id
                                                        ? (currentUser as User)
                                                        : chatPartner
                                                    : (message.senderId as User);
                                            if (!sender) return null;

                                            const senderId = sender._id;

                                            return (
                                                <ChatMessage
                                                    key={
                                                        message.id || message._id
                                                    }
                                                    message={message}
                                                    sender={sender}
                                                    isCurrentUser={
                                                        senderId ===
                                                        currentUser._id
                                                    }
                                                />
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center">
                                        <div className="bg-gray-100 p-4 rounded-full mb-4">
                                            <MessageCircle
                                                size={32}
                                                className="text-gray-400"
                                            />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-700">
                                            No messages yet
                                        </h3>
                                        <p className="text-gray-500 mt-1">
                                            Send a message to start the
                                            conversation
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Message input */}
                            <div className="border-t border-gray-200 p-4">
                                <form
                                    onSubmit={handleSendMessage}
                                    className="flex space-x-2"
                                >
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="rounded-full p-2"
                                        aria-label="Add emoji"
                                    >
                                        <Smile size={20} />
                                    </Button>

                                    <Input
                                        type="text"
                                        placeholder="Type a message..."
                                        value={newMessage}
                                        onChange={(e) =>
                                            setNewMessage(e.target.value)
                                        }
                                        fullWidth
                                        className="flex-1"
                                    />

                                    <Button
                                        type="submit"
                                        size="sm"
                                        disabled={
                                            !newMessage.trim() || isSending
                                        }
                                        className="rounded-full p-2 w-10 h-10 flex items-center justify-center"
                                        aria-label="Send message"
                                    >
                                        <Send size={18} />
                                    </Button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-4">
                            <div className="bg-gray-100 p-6 rounded-full mb-4">
                                <MessageCircle
                                    size={48}
                                    className="text-gray-400"
                                />
                            </div>
                            <h2 className="text-xl font-medium text-gray-700">
                                Select a conversation
                            </h2>
                            <p className="text-gray-500 mt-2 text-center">
                                Choose a contact from the list to start chatting
                            </p>
                        </div>
                    )}
                </div>
            </div>
            <CallOverlay
                callState={callState}
                localStream={localStream}
                remoteStream={remoteStream}
                onAccept={acceptCall}
                onReject={rejectCall}
                onHangup={hangupCall}
                onToggleMute={toggleMute}
                onToggleCamera={toggleCamera}
            />
        </>
    );
};
