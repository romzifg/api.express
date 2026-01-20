import { Request, Response, NextFunction } from "express";
import { verifyToken } from "utils/jwt";
import { AppError } from "utils/appError";

export const authenticate = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AppError("Unauthorized", 401);
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    req.user = decoded;
    next();
};
