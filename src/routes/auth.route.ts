import { Router } from "express";
import {
    loginUser,
    refreshToken,
    logout,
    checkToken,
} from "@controllers/auth.controller";
import {
    loginRateLimit,
    refreshRateLimit,
} from "@middlewares/rateLimit.middleware";
import { csrfProtection } from "@middlewares/csrf.middleware";

const router = Router();

router.post("/login", loginRateLimit, loginUser);
router.get("/check-token", checkToken);

// Refresh & logout = cookie + CSRF + rate limit
router.post(
    "/refresh-token",
    refreshRateLimit,
    csrfProtection,
    refreshToken
);

router.post(
    "/logout",
    refreshRateLimit,
    csrfProtection,
    logout
);

export default router;
