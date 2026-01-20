import { Request, Response, NextFunction } from "express";
import { AppError } from "utils/appError";

export const errorHandler = (
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const statusCode = err.statusCode || 500;

    return res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        ...(process.env.NODE_ENV === "development" && {
            stack: err.stack,
        }),
    });
};
