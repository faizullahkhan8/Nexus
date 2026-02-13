import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ChatConversation, Message, User } from "../../types";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { useSelector } from "react-redux";
import { IAuthProps } from "../../features/auth.slice";
import { Phone, Video } from "lucide-react";

interface ChatUserListProps {
    conversations: Array<
        Omit<ChatConversation, "participants"> & {
            otherUser: User;
            lastMessage?: Message;
        }
    >;
    enableCallActions?: boolean;
    onStartCall?: (user: User, type: "audio" | "video") => void;
}

export const ChatUserList: React.FC<ChatUserListProps> = ({
    conversations,
    enableCallActions = false,
    onStartCall,
}) => {
    const navigate = useNavigate();
    const { userId: activeUserId } = useParams<{ userId: string }>();
    const currentUser = useSelector(
        (state: { auth: IAuthProps }) => state.auth,
    );

    const handleSelectUser = (userId: string) => {
        navigate(`/chat/${userId}`);
    };

    return (
        <div className="bg-white border-r border-gray-200 w-full md:w-64 overflow-y-auto">
            <div className="py-4">
                <h2 className="px-4 text-lg font-semibold text-gray-800 mb-4">
                    Messages
                </h2>

                <div className="space-y-1">
                    {conversations.length > 0 ? (
                        conversations.map((conversation) => {
                            const otherUser = conversation.otherUser;
                            const lastMessage = conversation.lastMessage;
                            const isActive = activeUserId === otherUser._id;
                            const lastMessageSenderId =
                                lastMessage &&
                                typeof lastMessage.senderId === "string"
                                    ? lastMessage.senderId
                                    : lastMessage?.senderId?._id;

                            return (
                                <div
                                    key={conversation.id}
                                    className={`px-4 py-3 flex cursor-pointer transition-colors duration-200 group ${
                                        isActive
                                            ? "bg-primary-50 border-l-4 border-primary-600"
                                            : "hover:bg-gray-50 border-l-4 border-transparent"
                                    }`}
                                    onClick={() =>
                                        handleSelectUser(otherUser._id)
                                    }
                                >
                                    <Avatar
                                        src={
                                            otherUser.avatarUrl ||
                                            `https://dummyjson.com/image/150x150/008080/ffffff?text=${otherUser.name.split(" ")[0][0]}+${otherUser.name.split(" ")[otherUser.name.split(" ").length - 1][0]}`
                                        }
                                        alt={otherUser.name}
                                        size="md"
                                        status={
                                            otherUser.isOnline
                                                ? "online"
                                                : "offline"
                                        }
                                        className="mr-3 flex-shrink-0"
                                    />

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline gap-2">
                                            <h3 className="text-sm font-medium text-gray-900 truncate">
                                                {otherUser.name}
                                            </h3>

                                            <div className="flex items-center gap-2">
                                                {lastMessage && (
                                                    <span className="text-xs text-gray-500">
                                                        {formatDistanceToNow(
                                                            new Date(
                                                                lastMessage.timestamp ||
                                                                    lastMessage.createdAt ||
                                                                    "",
                                                            ),
                                                            { addSuffix: false },
                                                        )}
                                                    </span>
                                                )}

                                                {enableCallActions &&
                                                    onStartCall && (
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                type="button"
                                                                className="p-1 rounded-full text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                                                                aria-label={`Start voice call with ${otherUser.name}`}
                                                                onClick={(
                                                                    event,
                                                                ) => {
                                                                    event.stopPropagation();
                                                                    onStartCall(
                                                                        otherUser,
                                                                        "audio",
                                                                    );
                                                                }}
                                                            >
                                                                <Phone
                                                                    size={14}
                                                                />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="p-1 rounded-full text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                                                                aria-label={`Start video call with ${otherUser.name}`}
                                                                onClick={(
                                                                    event,
                                                                ) => {
                                                                    event.stopPropagation();
                                                                    onStartCall(
                                                                        otherUser,
                                                                        "video",
                                                                    );
                                                                }}
                                                            >
                                                                <Video
                                                                    size={14}
                                                                />
                                                            </button>
                                                        </div>
                                                    )}
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center mt-1">
                                            {lastMessage && (
                                                <p className="text-xs text-gray-600 truncate">
                                                    {lastMessageSenderId ===
                                                    currentUser._id
                                                        ? "You: "
                                                        : ""}
                                                    {lastMessage.content}
                                                </p>
                                            )}

                                            {lastMessage &&
                                                !lastMessage.isRead &&
                                                lastMessageSenderId !==
                                                    currentUser._id && (
                                                    <Badge
                                                        variant="primary"
                                                        size="sm"
                                                        rounded
                                                    >
                                                        New
                                                    </Badge>
                                                )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="px-4 py-8 text-center">
                            <p className="text-sm text-gray-500">
                                No conversations yet
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
