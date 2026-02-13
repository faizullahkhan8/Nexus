import React, { useEffect, useState } from "react";
import {
    Bell,
    MessageCircle,
    UserPlus,
    DollarSign,
    CheckCircle,
    FileText,
    Calendar,
} from "lucide-react";
import { Card, CardBody } from "../../components/ui/Card";
import { Avatar } from "../../components/ui/Avatar";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import {
    useGetAllNotificationsQuery,
    useMarkNotificationAsAllReadMutation,
    useMarkNotificationReadMutation,
} from "../../services/notification.service";
import { Notification as INotifications, User } from "../../types";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { socket } from "../../socket";
import { IAuthProps } from "../../features/auth.slice";

export const NotificationsPage: React.FC = () => {
    const auth = useSelector((state: { auth: IAuthProps }) =>
        Boolean(state.auth._id),
    );
    const [notifications, setNotifications] = useState<INotifications[]>([]);
    const {
        data: notificationData,
        isLoading: notificationLaoding,
        isError: notificationError,
        refetch: refetchNotifications,
    } = useGetAllNotificationsQuery(undefined);

    const [
        markNotificationRead,
        {
            isLoading: markNotificationsReadLoading,
            isError: markNotificationReadError,
        },
    ] = useMarkNotificationReadMutation();

    const [
        markNotificationsAsAllRead,
        {
            isLoading: markNotificationsAsAllReadLoading,
            isError: markNotificationsAsAllReadError,
        },
    ] = useMarkNotificationAsAllReadMutation();

    useEffect(() => {
        if (notificationData) setNotifications(notificationData.data);
    }, [notificationData]);

    const unreadCount = notifications.filter(
        (notification) => !notification.isRead,
    ).length;

    const notificationHandler = (notification: any, ack: any) => {
        console.log("New Notification received:", notification);
        setNotifications((prev) => [notification, ...prev]);
        if (ack) ack(true);
    };

    useEffect(() => {
        if (!auth) return;

        if (!socket.connected) socket.connect();

        socket.on("notification", notificationHandler);

        return () => {
            socket.off("notification", notificationHandler);
        };
    }, [auth]);

    const getNotificationIcon = ({ type }: INotifications) => {
        switch (type) {
            case "NEW_MESSAGE":
                return <MessageCircle size={16} className="text-blue-600" />;
            case "CONNECTION_REQUEST":
                return <UserPlus size={16} className="text-indigo-600" />;
            case "REQUEST_ACCEPTED":
                return <CheckCircle size={16} className="text-green-600" />;
            case "INVESTMENT_RECEIVED":
                return <DollarSign size={16} className="text-emerald-600" />;
            case "DOCUMENT_SHARED":
                return <FileText size={16} className="text-amber-600" />;
            case "MEETING_SCHEDULED":
                return <Calendar size={16} className="text-purple-600" />;
            default:
                return <Bell size={16} className="text-gray-600" />;
        }
    };

    const getNotificationLink = (notification: INotifications) => {
        const { type, sender } = notification;
        const senderId = typeof sender === "object" ? sender?._id : sender;

        switch (type) {
            case "NEW_MESSAGE":
                return `/chat/${senderId}`;
            case "CONNECTION_REQUEST":
                return "/dashboard/entrepreneur";
            case "REQUEST_ACCEPTED":
                return `/profile/${notification.sender?.role === "investor" ? "investor" : "entrepreneur"}/${senderId}`;
            case "INVESTMENT_RECEIVED":
                return "/deals";
            case "DOCUMENT_SHARED":
                return "/documents";
            case "MEETING_SCHEDULED":
                return "/dashboard/entrepreneur"; // or a specific meetings page if created
            default:
                return "/notifications";
        }
    };

    if (
        notificationError ||
        markNotificationReadError ||
        markNotificationsAsAllReadError
    )
        return <p>something went wronge try agian.</p>;

    if (
        notificationLaoding ||
        markNotificationsReadLoading ||
        markNotificationsAsAllReadLoading
    )
        return <p>Loading...</p>;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Notifications
                    </h1>
                    <p className="text-gray-600">
                        {unreadCount} unread of {notifications.length} total
                    </p>
                </div>

                <Button
                    onClick={async () => {
                        await markNotificationsAsAllRead().unwrap();
                        await refetchNotifications();
                    }}
                    variant="outline"
                    size="sm"
                    disabled={unreadCount === 0}
                >
                    Mark all as read
                </Button>
            </div>

            <div className="space-y-4">
                {notifications.map((notification) => (
                    <Card
                        key={notification._id}
                        className={`transition-colors duration-200 ${
                            !notification.isRead ? "bg-primary-50" : ""
                        }`}
                    >
                        <CardBody className="flex items-start p-4">
                            <Avatar
                                src={
                                    notification.sender.avatarUrl ||
                                    `https://dummyjson.com/image/150x150/008080/ffffff?text=${notification.sender?.name.split(" ")[0][0]}+${notification.sender?.name.split(" ")[notification.sender?.name.split(" ").length - 1][0]}`
                                }
                                alt={notification.sender.name}
                                size="md"
                                className="flex-shrink-0 mr-4"
                            />

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900">
                                        {notification.sender.name}
                                    </span>
                                    {!notification.isRead && (
                                        <>
                                            <Badge
                                                variant="primary"
                                                size="sm"
                                                rounded
                                            >
                                                New
                                            </Badge>
                                            <Badge variant="gray" size="sm">
                                                Unread
                                            </Badge>
                                        </>
                                    )}
                                </div>

                                <p className="text-gray-600 mt-1">
                                    {notification.message}
                                </p>

                                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                    {getNotificationIcon({
                                        type: notification.type,
                                    } as INotifications)}
                                    <span>{notification.type}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {!notification.isRead && (
                                    <Button
                                        onClick={async () => {
                                            await markNotificationRead(
                                                notification._id,
                                            ).unwrap();
                                            await refetchNotifications();
                                        }}
                                    >
                                        Mark as Read
                                    </Button>
                                )}
                                <Link to={getNotificationLink(notification)}>
                                    <Button>Goto Refrence</Button>
                                </Link>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>
        </div>
    );
};
