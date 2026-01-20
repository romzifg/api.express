import { Request, Response } from "express";
import { asyncHandler } from "middlewares/async.middleware";
import { successResponse } from "utils/response";
import { login } from "services/auth.service";

export const loginUser = asyncHandler(
    async (req: Request, res: Response) => {
        const { email, password } = req.body;

        const result = await login(email, password);
        return successResponse(res, result, "Login successful");
    }
);
