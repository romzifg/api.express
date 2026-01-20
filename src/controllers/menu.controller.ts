import { Request, Response } from "express";
import { asyncHandler } from "@middlewares/async.middleware";
import { successResponse } from "@utils/response";
import { getMenuByRole } from "services/menu.service";

export const getMyMenu = asyncHandler(
    async (req: Request, res: Response) => {
        const role = req.user!.role;

        const menus = await getMenuByRole(role);

        return successResponse(res, menus, "Menu fetched");
    }
);
