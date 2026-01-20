import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { registerRoutes } from "./routes";
import { errorHandler } from "@middlewares/error.middleware";
import { apiRateLimit } from "@middlewares/rateLimit.middleware";

const app = express();

/**
 * Trust proxy (WAJIB di production)
 * Agar rate limit & IP detection akurat
 */
app.set("trust proxy", 1);

/**
 * CORS configuration
 * WAJIB jika pakai cookie (refresh token)
 */
app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);

/**
 * Body & cookie parser
 */
app.use(express.json());
app.use(cookieParser());

/**
 * Global API rate limit
 */
app.use("/api", apiRateLimit);

/**
 * Register routes
 */
registerRoutes(app);

/**
 * Global error handler (HARUS PALING BAWAH)
 */
app.use(errorHandler);

export default app;
