import bcrypt from "bcrypt";
import { signToken } from "@utils/jwt";
import { AppError } from "@utils/appError";
import { Role } from "types/auth";

export const login = async (
    email: string,
    password: string
) => {
    // MOCK USER (replace with DB)
    const user = {
        id: "123",
        email: "admin@mail.com",
        password: await bcrypt.hash("password", 10),
        role: "ADMIN" as Role,
    };

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new AppError("Invalid credentials", 401);
    }

    const token = signToken({
        userId: user.id,
        role: user.role,
    });

    return { token };
};
