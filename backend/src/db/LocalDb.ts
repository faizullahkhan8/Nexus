import { Connection, createConnection, Model } from "mongoose";
import { IUserProps, UserSchema } from "../models/User.model";
import {
    IEntrepreneur,
    EntrepreneurSchema,
} from "../models/Entrepreneur.model";
import { IInvestor, InvestorSchema } from "../models/Investor.model";

let LocalDbConnection: Connection;
let LocalUserModel: Model<IUserProps>;
let LocalEntrepreneurModel: Model<IEntrepreneur>;
let LocalInvestorModel: Model<IInvestor>;

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
    }
};

export const getLocalUserModel = () => LocalUserModel || null;
export const getLocalEntrepreneurModel = () => LocalEntrepreneurModel || null;
export const getLocalInvestorModel = () => LocalInvestorModel || null;
