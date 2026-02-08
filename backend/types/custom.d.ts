import "express-session";

declare module "express-session" {
    interface SessionData {
        user: { _id: string; name: string; email: string; role: string };
    }
}

import "http";

declare module "http" {
    interface IncomingMessage {
        session: import("express-session").Session &
            Partial<import("express-session").SessionData>;
    }
}
