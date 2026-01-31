import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./services/auth.service";
import authReducer from "./features/auth.slice";

import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { requestApi } from "./services/requst.service";

const persistConfig = {
    key: "auth",
    storage,
};

const persistedReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
    reducer: {
        auth: persistedReducer,
        [authApi.reducerPath]: authApi.reducer,
        [requestApi.reducerPath]: requestApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            authApi.middleware,
            requestApi.middleware,
        ),
});

export const persistor = persistStore(store);
