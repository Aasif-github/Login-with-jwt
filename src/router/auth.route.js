import express from "express";
import { signIn, login } from "../controller/auth.controller.js";

const router = express();

router.post('/signin', signIn);
router.get('/login', login);

export default router;

