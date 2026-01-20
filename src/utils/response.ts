import { Response } from "express";

export const successResponse = (
    res: Response,
    data: any,
    message = "Success",
    statusCode = 200
) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};
