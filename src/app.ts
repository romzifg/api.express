import express from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { errorHandler } from "middlewares/error.middleware";

const app = express();

app.use(cors());
app.use(express.json());

// Register all routes
registerRoutes(app);

// Global error handler (HARUS PALING BAWAH)
app.use(errorHandler);

export default app;
