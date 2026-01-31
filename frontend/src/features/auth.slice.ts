import { createSlice } from "@reduxjs/toolkit";

export interface IAuthProps {
    _id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string;
    isOnline?: boolean;
}

const initialState: IAuthProps = {
    _id: "",
    name: "",
    email: "",
    role: "",
    avatarUrl: "",
    isOnline: false,
};

const AuthSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action) => {
            state._id = action.payload._id;
            state.name = action.payload.name;
            state.email = action.payload.email;
            state.role = action.payload.role;
            state.avatarUrl = action.payload.avatarUrl;
            state.isOnline = action.payload.isOnline;
        },
        logout: (state) => {
            state._id = "";
            state.email = "";
            state.name = "";
            state.avatarUrl = "";
            state.role = "";
            state.isOnline = false;
        },
    },
});

export const { login, logout } = AuthSlice.actions;
export default AuthSlice.reducer;
