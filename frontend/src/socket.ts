import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_BACKEND_SERVER_URL, {
    autoConnect: false,
    withCredentials: true,
});
