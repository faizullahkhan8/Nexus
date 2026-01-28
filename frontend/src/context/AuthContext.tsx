import React, { createContext, useState, useContext, useEffect } from "react";
import { User, AuthContextType } from "../types";
// Create Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local storage keys
const USER_STORAGE_KEY = "business_nexus_user";

// Auth Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);

    // Check for stored user on initial load
    useEffect(() => {
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const value = {
        user,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};

// Custom hook for using auth context
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
