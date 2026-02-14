import { useEffect } from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import { DashboardLayout } from "./components/layout/DashboardLayout";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";

import { EntrepreneurDashboard } from "./pages/dashboard/EntrepreneurDashboard";
import { InvestorDashboard } from "./pages/dashboard/InvestorDashboard";
import { EntrepreneurProfile } from "./pages/profile/EntrepreneurProfile";
import EntrepreneurEditProfile from "./pages/profile/EntrepreneurEditProfile";
import { InvestorProfile } from "./pages/profile/InvestorProfile";
import InvestorEditProfile from "./pages/profile/InvestorEditProfile";

import { InvestorsPage } from "./pages/investors/InvestorsPage";
import { EntrepreneursPage } from "./pages/entrepreneurs/EntrepreneursPage";
import { MessagesPage } from "./pages/messages/MessagesPage";
import { NotificationsPage } from "./pages/notifications/NotificationsPage";
import { DocumentsPage } from "./pages/documents/DocumentsPage";
import { SettingsPage } from "./pages/settings/SettingsPage";
import { HelpPage } from "./pages/help/HelpPage";
import { DealsPage } from "./pages/deals/DealsPage";
import { MeetingsManager } from "./pages/meeting/MeetingPage";

import { ChatPage } from "./pages/chat/ChatPage";
import { socket } from "./socket";
import { useSelector } from "react-redux";
import { IAuthProps } from "./features/auth.slice";
import {
    playMessageSound,
    playNotificationSound,
    primeSound,
} from "./utils/sound";

function App() {
    const auth = useSelector((state: { auth: IAuthProps }) =>
        Boolean(state.auth._id),
    );

    useEffect(() => {
        if (auth) {
            if (!socket.connected) {
                socket.connect();
            }
        } else {
            socket.disconnect();
        }
    }, [auth]);

    useEffect(() => {
        primeSound();
    }, []);

    useEffect(() => {
        if (!auth) return;

        const handleNotificationSound = (notification: { type?: string }) => {
            if (notification?.type === "NEW_MESSAGE") return;
            playNotificationSound();
        };

        const handleMessageSound = () => {
            playMessageSound();
        };

        socket.on("notification", handleNotificationSound);
        socket.on("new_message", handleMessageSound);

        return () => {
            socket.off("notification", handleNotificationSound);
            socket.off("new_message", handleMessageSound);
        };
    }, [auth]);

    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    <Route path="/" element={<DashboardLayout />}>
                        <Route
                            index
                            element={
                                <Navigate
                                    to="/dashboard/entrepreneur"
                                    replace
                                />
                            }
                        />
                        <Route
                            path="dashboard/entrepreneur"
                            element={<EntrepreneurDashboard />}
                        />
                        <Route
                            path="dashboard/investor"
                            element={<InvestorDashboard />}
                        />
                        <Route
                            path="profile/entrepreneur/:id"
                            element={<EntrepreneurProfile />}
                        />
                        <Route
                            path="profile/entrepreneur/edit"
                            element={<EntrepreneurEditProfile />}
                        />
                        <Route
                            path="profile/investor/:id"
                            element={<InvestorProfile />}
                        />
                        <Route
                            path="profile/investor/edit"
                            element={<InvestorEditProfile />}
                        />
                        <Route path="investors" element={<InvestorsPage />} />
                        <Route
                            path="entrepreneurs"
                            element={<EntrepreneursPage />}
                        />
                        <Route path="messages" element={<MessagesPage />} />
                        <Route
                            path="notifications"
                            element={<NotificationsPage />}
                        />
                        <Route path="documents" element={<DocumentsPage />} />
                        <Route path="deals" element={<DealsPage />} />
                        <Route path="meetings" element={<MeetingsManager />} />
                        <Route path="settings" element={<SettingsPage />} />
                        <Route path="help" element={<HelpPage />} />
                        <Route path="chat" element={<ChatPage />} />
                        <Route path="chat/:userId" element={<ChatPage />} />
                    </Route>

                    <Route
                        path="*"
                        element={<Navigate to="/login" replace />}
                    />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
