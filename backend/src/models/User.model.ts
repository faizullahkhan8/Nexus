import { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUserProps extends Document {
    name: string;
    email: string;
    password: string;
    role: "entrepreneur" | "investor";
    isOnline: boolean;
    avatarUrl: string;
    bio: string;
    twoFactor: boolean;
    ComparePassword: (password: string) => Promise<boolean>;
}

export const UserSchema = new Schema<IUserProps>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            trim: true,
        },
        role: {
            type: String,
            required: true,
            enum: ["entrepreneur", "investor"],
        },
        isOnline: {
            type: Boolean,
            default: true,
        },
        avatarUrl: {
            type: String,
            trim: true,
        },
        bio: {
            type: String,
            trim: true,
        },
        twoFactor: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true },
);

UserSchema.pre<IUserProps>("save", async function () {
    if (!this.isModified("password")) {
        return;
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password as string, salt);
    } catch (error) {
        throw error;
    }
});

UserSchema.methods.ComparePassword = async function (
    enteredPassword: string,
): Promise<Boolean> {
    return await bcrypt.compare(enteredPassword, this.password);
};
