import express from "express";
import { signIn, login, refreshToken } from "../controller/auth.controller.js";
import { verifyJWT } from "../middleware/verifyJwt.js";

const router = express();

router.post('/signin', signIn);
router.get('/login', login);
router.get('/refresh-token', refreshToken);

// to check token is valid
router.get('/test-token', verifyJWT, (req, res) => {
    
    res.send('ok');

});

export default router;

