"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotificationUtil = void 0;
const index_1 = require("../index");
const createNotificationUtil = async (params, getLocalNotificationModel) => {
    try {
        const LocalNotificationModel = getLocalNotificationModel();
        const notification = await LocalNotificationModel.create({
            recipient: params.recipient,
            sender: params.sender,
            type: params.type,
            message: params.message,
            link: params.link,
        });
        const populatedNotification = await LocalNotificationModel.findById(notification._id).populate("sender", "_id name email avatarUrl role isOnline createdAt");
        index_1.io.to(`user:${params.recipient}`).emit("notification", populatedNotification, (ack) => {
            if (ack) {
                console.log(`Notification delivered to user:${params.recipient}`);
            }
            else {
                console.log(`User user:${params.recipient} is offline. Notification saved to DB.`);
            }
        });
        return populatedNotification;
    }
    catch (error) {
        console.error("Notification Utility Error:", error);
    }
};
exports.createNotificationUtil = createNotificationUtil;
