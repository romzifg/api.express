import crypto from "crypto";
import { prisma } from "libs/prisma";

const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const refreshTokenRepo = {
  async save(token: string, userId: string, expiresAt: Date) {
    return prisma.refreshToken.create({
      data: {
        tokenHash: hashToken(token),
        userId,
        expiresAt,
      },
    });
  },

  async find(token: string) {
    return prisma.refreshToken.findUnique({
      where: {
        tokenHash: hashToken(token),
      },
    });
  },

  async revoke(token: string) {
    return prisma.refreshToken.updateMany({
      where: {
        tokenHash: hashToken(token),
      },
      data: {
        revoked: true,
      },
    });
  },

  async revokeAll(userId: string) {
    return prisma.refreshToken.updateMany({
      where: {
        userId,
        revoked: false,
      },
      data: {
        revoked: true,
      },
    });
  },
};
