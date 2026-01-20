import { AppError } from "utils/appError";

export const getUsers = async () => {
    const users: any = [];

    if (!users) {
        throw new AppError("Users not found", 404);
    }

    return users;
};
