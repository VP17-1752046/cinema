import express from "express";
import { loginUser, registerUser } from "../Controllers/UserControllers.js";

const router = express.Router();

router.post("/", registerUser);
router.post("/login", loginUser);

export default router;
