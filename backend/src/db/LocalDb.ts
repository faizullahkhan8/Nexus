import { Connection, createConnection, Model } from "mongoose";
import { IUserProps, UserSchema } from "../models/User.model";
import {
    IEntrepreneur,
    EntrepreneurSchema,
} from "../models/Entrepreneur.model";
import { IInvestor, InvestorSchema } from "../models/Investor.model";
import { IRequest, requestSchema } from "../models/request.model";

let LocalDbConnection: Connection;
let LocalUserModel: Model<IUserProps>;
let LocalEntrepreneurModel: Model<IEntrepreneur>;
let LocalInvestorModel: Model<IInvestor>;
let LocalRequestModel: Model<IRequest>;

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
    }
};

export const getLocalUserModel = () => LocalUserModel || null;
export const getLocalEntrepreneurModel = () => LocalEntrepreneurModel || null;
export const getLocalInvestorModel = () => LocalInvestorModel || null;
export const getLocalRequestModel = () => LocalRequestModel || null;
