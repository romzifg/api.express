import { ROLE_MENU } from "config/role-permission";
import { Role } from "types/auth";
import { AppError } from "utils/appError";

export const getMenuByRole = async (role: Role) => {
    const menus = ROLE_MENU[role];

    if (!menus) {
        throw new AppError("Menu not found", 404);
    }

    return menus;
};
