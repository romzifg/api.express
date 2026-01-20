import { Router } from "express";
import { authenticate } from "@middlewares/auth.middleware";
import { authorize } from "@middlewares/role.middleware";
import { getUserList } from "@controllers/user.controller";

const router = Router();

router.get(
    "/",
    authenticate,
    authorize(["ADMIN"]),
    getUserList
);

export default router;
