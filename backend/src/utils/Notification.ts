import { Types } from "mongoose";

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

        return notification;
    } catch (error) {
        console.error("Notification Utility Error:", error);
    }
};
