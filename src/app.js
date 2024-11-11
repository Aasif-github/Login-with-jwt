import express from "express";
import bodyParser from "body-parser";
import authRouter from './router/auth.route.js';
import dotenv from 'dotenv'; 

const app = express();
dotenv.config();

app.use(bodyParser.json()); // or we can use express.json() as well

app.use('/v1/api', authRouter);

app.get('/health', (req, res) => {
    res.send('ok');
})

export default app;