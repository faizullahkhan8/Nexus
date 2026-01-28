import { createSlice } from "@reduxjs/toolkit";

export interface IAuthProps {
    name: string;
    email: string;
    role: string;
}

const initialState: IAuthProps = {
    name: "",
    email: "",
    role: "",
};

export const AuthSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action) => {
            state.name = action.payload.name;
            state.email = action.payload.email;
            state.role = action.payload.role;
        },
        logout: (state) => {
            state.email = "";
            state.name = "";
            state.role = "";
        },
    },
});

export const { login, logout } = AuthSlice.actions;
export default AuthSlice.reducer;
