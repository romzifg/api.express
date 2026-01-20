import bcrypt from "bcrypt";

import {
  signAccessToken,
  signRefreshToken,
  verifyToken,
} from "@utils/jwt";
import { AppError } from "@utils/appError";
import { Role } from "types/auth";
import { refreshTokenRepo } from "repositories/refreshToken.repo";
import { prisma } from "libs/prisma";
import { authAuditRepo } from "repositories/authAudit.repo";
import { AuthEvent } from "@prisma/client";

/**
 * Jumlah hari refresh token berlaku
 * - process.env selalu string → harus di-cast ke number
 * - fallback ke 7 hari jika env tidak ada
 */
const REFRESH_EXPIRE_DAYS = Number(
  process.env.REFRESH_EXPIRE_DAYS ?? 7
);

export type LoginResult = {
  userId: string;
  accessToken: string;
  refreshToken: string;
};

/**
 * =====================
 * LOGIN SERVICE
 * =====================
 * - Validasi email & password
 * - Log LOGIN_FAILED / LOGIN_SUCCESS
 * - Issue access & refresh token
 */
export const login = async (
  email: string,
  password: string
): Promise<LoginResult> => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  // ❌ User tidak ditemukan
  if (!user) {
    await authAuditRepo.log({
      event: AuthEvent.LOGIN_FAILED,
      metadata: { email },
    });
    throw new AppError("Invalid credentials", 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);

  // ❌ Password salah
  if (!isMatch) {
    await authAuditRepo.log({
      userId: user.id,
      event: AuthEvent.LOGIN_FAILED,
    });
    throw new AppError("Invalid credentials", 401);
  }

  // Payload minimal (no sensitive data)
  const payload = {
    userId: user.id,
    role: user.role as Role,
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await refreshTokenRepo.save(
    refreshToken,
    user.id,
    new Date(Date.now() + REFRESH_EXPIRE_DAYS * 24 * 60 * 60 * 1000)
  );

  // ✅ LOGIN SUCCESS
  await authAuditRepo.log({
    userId: user.id,
    event: AuthEvent.LOGIN_SUCCESS,
  });

  return {
    userId: user.id,
    accessToken,
    refreshToken,
  };
};

/**
 * =====================
 * REFRESH TOKEN ROTATION
 * =====================
 * - Refresh token hanya boleh dipakai SEKALI
 * - Token lama langsung direvoke
 * - Token baru di-issue & disimpan
 * - Jika token reuse terdeteksi → revoke semua token user
 */
export const rotateRefreshToken = async (
  oldRefreshToken: string
) => {
  const stored = await refreshTokenRepo.find(oldRefreshToken);

  if (!stored || stored.revoked) {
    if (stored) {
      await authAuditRepo.log({
        userId: stored.userId,
        event: AuthEvent.TOKEN_REUSE_DETECTED,
      });
      await refreshTokenRepo.revokeAll(stored.userId);
    }

    throw new AppError("Refresh token reuse detected", 401);
  }

  if (stored.expiresAt < new Date()) {
    await authAuditRepo.log({
      userId: stored.userId,
      event: AuthEvent.TOKEN_EXPIRED,
    });

    await refreshTokenRepo.revoke(oldRefreshToken);
    throw new AppError("Refresh token expired", 401);
  }

  const payload = verifyToken(oldRefreshToken);

  await refreshTokenRepo.revoke(oldRefreshToken);

  const newAccessToken = signAccessToken(payload);
  const newRefreshToken = signRefreshToken(payload);

  await refreshTokenRepo.save(
    newRefreshToken,
    payload.userId,
    new Date(Date.now() + REFRESH_EXPIRE_DAYS * 86400000)
  );

  return {
    userId: payload.userId,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};


/**
 * =====================
 * LOGOUT (OPTIONAL)
 * =====================
 * - Revoke refresh token current device
 */
export const logout = async (refreshToken: string) => {
  await refreshTokenRepo.revoke(refreshToken);
};
