import { Request } from "express";
import { authAuditRepo } from "repositories/authAudit.repo";
import { AuthEvent } from "@prisma/client";

/**
 * Extract audit context from request
 */
export const logAuthEvent = async (
    req: Request,
    event: AuthEvent,
    options?: {
        userId?: string;
        metadata?: Record<string, any>;
    }
) => {
    await authAuditRepo.log({
        userId: options?.userId,
        event,
        ipAddress:
            req.headers["x-forwarded-for"]?.toString().split(",")[0] ||
            req.socket.remoteAddress,
        userAgent: req.headers["user-agent"],
        metadata: options?.metadata,
    });
};
