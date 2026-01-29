import { createSlice } from "@reduxjs/toolkit";

export interface IAuthProps {
    _id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string;
}

const initialState: IAuthProps = {
    _id: "",
    name: "",
    email: "",
    role: "",
    avatarUrl: "",
};

export const AuthSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action) => {
            state._id = action.payload._id;
            state.name = action.payload.name;
            state.email = action.payload.email;
            state.role = action.payload.role;
            state.avatarUrl = action.payload.avatarUrl;
        },
        logout: (state) => {
            state._id = "";
            state.email = "";
            state.name = "";
            state.avatarUrl = "";
            state.role = "";
        },
    },
});

export const { login, logout } = AuthSlice.actions;
export default AuthSlice.reducer;
