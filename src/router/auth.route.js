import express from "express";
import { signIn, login, refreshToken } from "../controller/auth.controller.js";
import { verifyJWT } from "../middleware/verifyJwt.js";
import path from 'path';
import { fileURLToPath } from 'url';

const router = express();


// Get the current directory name in ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Set up the path to serve static files (optional)
router.use(express.static(path.resolve(__dirname, '../../frontend')));

// Debug: Print the path to verify it is correct
const dashboardPath = path.join(__dirname, '../../frontend/login/dashboard.html');
console.log('Path to dashboard.html:', dashboardPath);


router.post('/signin', signIn);
router.post('/login', login);
router.get('/refresh-token', refreshToken);

router.get('/dashboard', verifyJWT, (req, res) => {
    console.log('inside dashboard', __dirname);
     
    res.sendFile(path.join(__dirname, '../../frontend/login/dashboard.html'));
    
})
// to check token is valid
router.get('/test-token', verifyJWT, (req, res) => {
    
    res.send('ok');

});

export default router;

