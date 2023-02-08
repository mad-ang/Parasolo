import http from 'http';
import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth';
import chatRouter from './routes/chat';
import imageRouter from './routes/image';
// import { sequelize } from './DB/db'
// import socialRoutes from "@colyseus/social/express"
import type { ErrorRequestHandler } from "express";
import 'express-async-errors';
import { connectDB } from './DB/db';
import { Socket } from 'socket.io';
import S3 from './s3';

const socketPort = Number(process.env.SOCKET_PORT || 5005);
const app = express();
app.set('view engine', 'ejs'); 

const options: cors.CorsOptions = {
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'X-Access-Token',
    'authorization',
  ],
  credentials: true,
  methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
  origin: [
    'https://www.para-solo.site',
    'http://www.para-solo.site',
    'http://localhost:5173',
    'http://localhost:5174',
    `http://3.39.240.238`,
  ],
  preflightContinue: false,
};

app.use(cors(options));
app.use(express.json());
const socketServer = http.createServer(app);
connectDB()
.then((db) => {
  socketServer.listen(socketPort, () => console.log(`socketServer is running on ${socketPort}`));
  
  console.log(`Listening on wss://localhost:${socketServer}`);
})
.catch(console.error);

export const userMap = new Map<string, Socket>();
const router = express.Router()

app.use('/api-server', router);
router.use('/auth', authRouter);
router.use('/chat', chatRouter);
router.use('/image', imageRouter);



const errorHandler: ErrorRequestHandler = (err, req, res, next) => {};

app.use(errorHandler);
// app.use((err, res) => {
//   console.error(err);
//   res.status(500).send(err);
//   // res.status(err.status).send(err.message)
// });



S3.init();
