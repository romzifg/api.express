import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/async.middleware";
import { successResponse } from "../utils/response";
import { getUsers } from "../services/user.service";

export const getUserList = asyncHandler(
    async (req: Request, res: Response) => {
        const users = await getUsers();
        return successResponse(res, users, "User list fetched");
    }
);
