import jwt, { TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";
import { JwtPayload, TokenStatusResult } from "types/auth";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const ACCESS_EXPIRES_IN = "15m";
const REFRESH_EXPIRES_IN = "7d";

export const signAccessToken = (payload: JwtPayload) => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: ACCESS_EXPIRES_IN,
    });
};

export const signRefreshToken = (payload: JwtPayload) => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: REFRESH_EXPIRES_IN,
    });
};

export const verifyToken = (token: string): JwtPayload => {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
};

export const decodeToken = (
    token: string
): (JwtPayload & { exp?: number }) | null => {
    return jwt.decode(token) as (JwtPayload & { exp?: number }) | null;
};

export const checkTokenStatus = (
    token: string
): TokenStatusResult => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & {
            exp: number;
        };

        return {
            valid: true,
            expired: false,
            payload: decoded,
            expiresAt: decoded.exp,
        };
    } catch (error) {
        if (error instanceof TokenExpiredError) {
            const decoded = decodeToken(token);

            return {
                valid: false,
                expired: true,
                expiresAt: decoded?.exp,
            };
        }

        if (error instanceof JsonWebTokenError) {
            return {
                valid: false,
                expired: false,
            };
        }

        // fallback (safety)
        return {
            valid: false,
            expired: false,
        };
    }
};

