import { Request, Response } from "express";
import { asyncHandler } from "middlewares/async.middleware";
import { successResponse } from "utils/response";
import {
    login,
    rotateRefreshToken,
} from "services/auth.service";
import { checkTokenStatus } from "utils/jwt";
import { AppError } from "utils/appError";
import { refreshTokenRepo } from "repositories/refreshToken.repo";
import { generateCsrfToken } from "utils/csrf";
import { logAuthEvent } from "utils/audit";
import { AuthEvent } from "@prisma/client";

const refreshTokenCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

const csrfCookieOptions = {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
};

/**
 * =====================
 * LOGIN
 * =====================
 */
export const loginUser = asyncHandler(
    async (req: Request, res: Response) => {
        const { email, password } = req.body;

        let loginResult: {
            userId: string;
            accessToken: string;
            refreshToken: string;
        };

        try {
            loginResult = await login(email, password);
        } catch (error) {
            await logAuthEvent(req, AuthEvent.LOGIN_FAILED, {
                metadata: { email },
            });
            throw error;
        }

        const { userId, accessToken, refreshToken } = loginResult;

        await logAuthEvent(req, AuthEvent.LOGIN_SUCCESS, {
            userId,
        });

        res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

        return successResponse(res, { accessToken }, "Login successful");
    }
);


/**
 * =====================
 * CHECK TOKEN STATUS
 * =====================
 */
export const checkToken = asyncHandler(
    async (req: Request, res: Response) => {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            throw new AppError("Token not provided", 401);
        }

        const token = authHeader.split(" ")[1];
        const result = checkTokenStatus(token);

        if (!result.valid) {
            if (result.expired) {
                await logAuthEvent(req, AuthEvent.TOKEN_EXPIRED);
            }

            return res.status(401).json({
                success: false,
                message: result.expired ? "Token expired" : "Invalid token",
                data: { expiresAt: result.expiresAt },
            });
        }

        return successResponse(
            res,
            {
                userId: result.payload.userId,
                role: result.payload.role,
                expiresAt: result.expiresAt,
            },
            "Token is valid"
        );
    }
);

/**
 * =====================
 * REFRESH TOKEN (ROTATION)
 * =====================
 */
export const refreshToken = asyncHandler(
    async (req: Request, res: Response) => {
        const oldRefreshToken = req.cookies?.refreshToken;
        if (!oldRefreshToken) {
            throw new AppError("Refresh token not found", 401);
        }

        const {
            userId,
            accessToken,
            refreshToken: newRefreshToken,
        } = await rotateRefreshToken(oldRefreshToken);

        const csrfToken = generateCsrfToken();

        res.cookie(
            "refreshToken",
            newRefreshToken,
            refreshTokenCookieOptions
        );
        res.cookie("XSRF-TOKEN", csrfToken, csrfCookieOptions);

        // ✅ SUCCESS LOG (controller boleh log)
        await logAuthEvent(req, AuthEvent.TOKEN_REFRESH, {
            userId,
        });

        return successResponse(
            res,
            { accessToken },
            "Token refreshed"
        );
    }
);


/**
 * =====================
 * LOGOUT
 * =====================
 */
export const logout = asyncHandler(
    async (req: Request, res: Response) => {
        const refreshToken = req.cookies?.refreshToken;

        if (refreshToken) {
            await refreshTokenRepo.revoke(refreshToken);
        }

        await logAuthEvent(req, AuthEvent.LOGOUT);

        res.clearCookie("refreshToken", refreshTokenCookieOptions);

        return successResponse(res, null, "Logged out");
    }
);
