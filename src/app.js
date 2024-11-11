import express from "express";
import bodyParser from "body-parser";
import authRouter from './router/auth.route.js';

const app = express();

app.use(bodyParser.json());

app.use('/v1/api', authRouter);

app.get('/health', (req, res) => {
    res.send('ok');
})

export default app;