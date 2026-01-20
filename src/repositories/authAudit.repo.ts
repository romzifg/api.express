import { prisma } from "libs/prisma";
import { AuthEvent } from "@prisma/client";

interface AuditPayload {
    userId?: string;
    event: AuthEvent;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
}

/**
 * Centralized audit logger
 */
export const authAuditRepo = {
    async log(payload: AuditPayload) {
        return prisma.authAuditLog.create({
            data: payload,
        });
    },
};
