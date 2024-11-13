import express from "express";
import bodyParser from "body-parser";
import authRouter from './router/auth.route.js';
import dotenv from 'dotenv'; 
import cookieParser from "cookie-parser";
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const app = express();
dotenv.config();
app.use(cookieParser());
app.use(bodyParser.json()); // or we can use express.json() as well

app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/api/v1', authRouter);

app.get('/health', (req, res) => {
    res.send('ok');
})

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files (e.g., HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '../frontend/login')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/login', 'index.html'));
});


// app.get('/', function (req, res) {
//     // Cookies that have not been signed
//     console.log('Cookies: ', req.cookies)
//     // Cookies that have been signed
//     console.log('Signed Cookies: ', req.signedCookies)
//   })

export default app;