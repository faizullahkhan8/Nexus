import React, { useMemo } from "react";
import { ChatUserList } from "../../components/chat/ChatUserList";
import { useGetAllUserRequestsQuery } from "../../services/requst.service";
import { useSelector } from "react-redux";
import { IAuthProps } from "../../features/auth.slice";
import { CollaborationRequest } from "../../types";
import { MessageCircle } from "lucide-react";
// import { MessageCircle } from 'lucide-react';

export const MessagesPage: React.FC = () => {
    const currentUser = useSelector(
        (state: { auth: IAuthProps }) => state.auth,
    );

    const { data: requestsData } = useGetAllUserRequestsQuery({});

    const conversations = useMemo(() => {
        if (!requestsData?.requests?.length || !currentUser?._id) {
            return [];
        }

        return (requestsData.requests as CollaborationRequest[])
            .filter((req) => req.status === "accepted")
            .map((req) => {
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

    if (!currentUser?._id) return null;

    return (
        <div className="h-[calc(100vh-8rem)] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
            {conversations.length > 0 ? (
                <ChatUserList conversations={conversations} />
            ) : (
                <div className="h-full flex flex-col items-center justify-center p-8">
                    <div className="bg-gray-100 p-6 rounded-full mb-4">
                        <MessageCircle size={32} className="text-gray-400" />
                    </div>
                    <h2 className="text-xl font-medium text-gray-900">
                        No messages yet
                    </h2>
                    <p className="text-gray-600 text-center mt-2">
                        Start connecting with entrepreneurs and investors to
                        begin conversations
                    </p>
                </div>
            )}
        </div>
    );
};
