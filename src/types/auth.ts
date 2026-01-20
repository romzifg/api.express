export type Role = "ADMIN" | "USER";

export interface JwtPayload {
    userId: string;
    role: Role;
}

/**
 * Token VALID
 */
export type TokenValidResult = {
    valid: true;
    expired: false;
    payload: JwtPayload;
    expiresAt: number;
};

/**
 * Token INVALID / EXPIRED
 */
export type TokenInvalidResult = {
    valid: false;
    expired: boolean;
    expiresAt?: number;
};

/**
 * Union result
 */
export type TokenStatusResult =
    | TokenValidResult
    | TokenInvalidResult;