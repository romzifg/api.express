import { Application } from "express";
import userRoutes from "./user.route";
import menuRoute from "./menu.route";
import authRoutes from "./auth.route";

export const registerRoutes = (app: Application) => {
    app.use("/api/auth", authRoutes);
    app.use("/api/menu", menuRoute);
    
    app.use("/api/users", userRoutes);
};
