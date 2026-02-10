import { Connection, createConnection, Model } from "mongoose";
import { IUserProps, UserSchema } from "../models/User.model";
import {
    IEntrepreneur,
    EntrepreneurSchema,
} from "../models/Entrepreneur.model";
import { IInvestor, InvestorSchema } from "../models/Investor.model";
import { IRequest, requestSchema } from "../models/request.model";
import {
    INotification,
    notificationSchema,
} from "../models/Notification.model";
import {
    conversationSchema,
    IConversation,
} from "../models/Conversation.model";
import { IMessage, messageSchema } from "../models/message.model";
import { IDocument, DocumentSchema } from "../models/Document.model";

let LocalDbConnection: Connection;
let LocalUserModel: Model<IUserProps>;
let LocalEntrepreneurModel: Model<IEntrepreneur>;
let LocalInvestorModel: Model<IInvestor>;
let LocalRequestModel: Model<IRequest>;
let LocalNotificationModel: Model<INotification>;
let LocalConversationModel: Model<IConversation>;
let LocalMessageModel: Model<IMessage>;
let LocalDocumentModel: Model<IDocument>;

export const connectLocalDb = async () => {
    LocalDbConnection = await createConnection(
        process.env.DB_URI || "",
    ).asPromise();

    if (LocalDbConnection.host) {
        console.log("Db connected to :" + LocalDbConnection.host);

        LocalUserModel = LocalDbConnection.model<IUserProps>(
            "Users",
            UserSchema,
        );

        LocalEntrepreneurModel = LocalDbConnection.model<IEntrepreneur>(
            "Entrepreneurs",
            EntrepreneurSchema,
        );

        LocalInvestorModel = LocalDbConnection.model<IInvestor>(
            "Investors",
            InvestorSchema,
        );

        LocalRequestModel = LocalDbConnection.model<IRequest>(
            "Requests",
            requestSchema,
        );

        LocalNotificationModel = LocalDbConnection.model<INotification>(
            "Notifications",
            notificationSchema,
        );

        LocalConversationModel = LocalDbConnection.model<IConversation>(
            "Conversations",
            conversationSchema,
        );

        LocalMessageModel = LocalDbConnection.model<IMessage>(
            "Messages",
            messageSchema,
        );

        LocalDocumentModel = LocalDbConnection.model<IDocument>(
            "Documents",
            DocumentSchema,
        );
    }
};

export const getLocalUserModel = () => LocalUserModel || null;
export const getLocalEntrepreneurModel = () => LocalEntrepreneurModel || null;
export const getLocalInvestorModel = () => LocalInvestorModel || null;
export const getLocalRequestModel = () => LocalRequestModel || null;
export const getLocalNotificationModel = () => LocalNotificationModel || null;
export const getLocalConversationModel = () => LocalConversationModel || null;
export const getLocalMessageModel = () => LocalMessageModel || null;
export const getLocalDocumentModel = () => LocalDocumentModel || null;
