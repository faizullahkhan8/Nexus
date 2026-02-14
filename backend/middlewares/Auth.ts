import { Request, Response, NextFunction } from "express";
import ErrorResponse from "../utils/ErrorResponse";

export const protect = (req: Request, res: Response, next: NextFunction) => {
    if (req.session && req.session.user) {
        return next();
    } else {
        throw new ErrorResponse("Not authorized, please log in", 401);
    }
};

export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!roles.includes(req.session.user?.role as string)) {
            throw new ErrorResponse(
                `User role ${req.session.user?.role} is not authorized to access this route`,
                403,
            );
        }
        next();
    };
};
