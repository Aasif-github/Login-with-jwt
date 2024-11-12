import express from "express";
import { signIn, login } from "../controller/auth.controller.js";
import { verifyJWT } from "../middleware/verifyJwt.js";

const router = express();

router.post('/signin', signIn);
router.get('/login', login);

// to check token is valid
router.get('/test-token', verifyJWT, (req, res) => {
    
    res.send('ok');

});

export default router;

