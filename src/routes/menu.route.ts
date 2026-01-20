import { Router } from "express";
import { authenticate } from "@middlewares/auth.middleware";
import { getMyMenu } from "controllers/menu.controller";

const router = Router();

router.get("/me", authenticate, getMyMenu);

export default router;
