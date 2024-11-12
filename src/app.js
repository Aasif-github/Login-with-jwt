import express from "express";
import bodyParser from "body-parser";
import authRouter from './router/auth.route.js';
import dotenv from 'dotenv'; 
import cookieParser from "cookie-parser";

const app = express();
dotenv.config();
app.use(cookieParser());
app.use(bodyParser.json()); // or we can use express.json() as well

app.use('/v1/api', authRouter);

app.get('/health', (req, res) => {
    res.send('ok');
})

app.get('/', function (req, res) {
    // Cookies that have not been signed
    console.log('Cookies: ', req.cookies)
    // Cookies that have been signed
    console.log('Signed Cookies: ', req.signedCookies)
  })

export default app;