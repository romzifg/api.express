import rateLimit from "express-rate-limit";
import { Request } from "express";

/**
 * Helper untuk ambil IP asli (penting di production)
 */
const getClientIp = (req: Request) => {
    return (
        req.headers["x-forwarded-for"]?.toString().split(",")[0] ||
        req.socket.remoteAddress ||
        "unknown"
    );
};

/**
 * Login rate limit
 * - Anti brute force
 */
export const loginRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 5, // 5x percobaan
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getClientIp,
    message: {
        success: false,
        message: "Too many login attempts, please try again later",
    },
});

/**
 * Refresh token rate limit
 * - Anti abuse refresh endpoint
 */
export const refreshRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getClientIp,
    message: {
        success: false,
        message: "Too many refresh attempts, please slow down",
    },
});

/**
 * General API rate limit
 */
export const apiRateLimit = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 menit
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getClientIp,
});
