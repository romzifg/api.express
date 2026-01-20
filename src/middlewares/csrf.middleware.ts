import { Request, Response, NextFunction } from "express";
import { AppError } from "@utils/appError";
import { authAuditRepo } from "repositories/authAudit.repo";
import { AuthEvent } from "@prisma/client";

const CSRF_COOKIE_NAME = "XSRF-TOKEN";
const CSRF_HEADER_NAME = "x-csrf-token";

/**
 * CSRF protection middleware
 * - Compare CSRF token in cookie vs header
 */
export const csrfProtection = async (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    const csrfCookie = req.cookies?.[CSRF_COOKIE_NAME];
    const csrfHeader = req.headers[CSRF_HEADER_NAME] as string | undefined;

    if (!csrfCookie || !csrfHeader) {
        throw new AppError("CSRF token missing", 403);
    }

    if (csrfCookie !== csrfHeader) {
        await authAuditRepo.log({
            event: AuthEvent.CSRF_FAILED,
        });
        throw new AppError("Invalid CSRF token", 403);
    }

    next();
};
