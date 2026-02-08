import { Types } from "mongoose";
import { io } from "../index";

interface INotificationParams {
    recipient: string | Types.ObjectId;
    sender?: string | Types.ObjectId;
    type:
        | "CONNECTION_REQUEST"
        | "REQUEST_ACCEPTED"
        | "NEW_MESSAGE"
        | "DOCUMENT_SHARED"
        | "MEETING_SCHEDULED"
        | "INVESTMENT_RECEIVED";
    message: string;
    link?: Types.ObjectId | string;
}

export const createNotificationUtil = async (
    params: INotificationParams,
    getLocalNotificationModel: any,
) => {
    try {
        const LocalNotificationModel = getLocalNotificationModel();

        const notification = await LocalNotificationModel.create({
            recipient: params.recipient,
            sender: params.sender,
            type: params.type,

            message: params.message,
            link: params.link,
        });

        const populatedNotification = await LocalNotificationModel.findById(
            notification._id,
        ).populate("sender", "_id name email avatarUrl role isOnline createdAt");

        io.to(`user:${params.recipient}`).emit(
            "notification",
            populatedNotification,
            (ack: any) => {
                if (ack) {
                    console.log(
                        `Notification delivered to user:${params.recipient}`,
                    );
                } else {
                    console.log(
                        `User user:${params.recipient} is offline. Notification saved to DB.`,
                    );
                }
            },
        );

        return populatedNotification;
    } catch (error) {
        console.error("Notification Utility Error:", error);
    }
};
