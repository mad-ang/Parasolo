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
import { connectDB, createCollection } from './DB/db';
import { chatController } from './controllers/ChatControllers';
import { Socket } from 'socket.io';
import S3 from './s3';
var cookieParser = require('cookie-parser');



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
// app.get('/', (req, res) => {
//   console.log(req.header);
//   // console.log(req.socket);
//   res.status(200).json();
// });

// export const io = require('socket.io')(socketServer, {
//   // path: '/socket/',
//   cors: {
//     origin: [ 'https://www.para-solo.site','http://www.para-solo.site',],
//     methods: ['GET', 'POST'],
//     credentials: true,
//   },
// });
// console.log(io);
// // app.use(cookieParser());

// io.on('connection', (socket: Socket) => {
//   socket.on('whoAmI', (userId) => {
//     console.log(userId, "logined in socket-server.")
//     userMap.set(userId, socket);
//   });
//   console.log('connection');
//   chatController(socket);

//   socket.on('disconnect', () => {
//     // Todo: delete on userMap.
//     console.log('the challenger disconnected');
//   });

//   socket.on('connect_error', (err) => {
//     console.log(`connect_error due to ${err.message}`);
//   });
// });

const router = express.Router()
//@ts-ignore
// app.use('/', (req, res) => {
//   console.log('here /');
// })
//@ts-ignore
app.use('/api-server', router);
router.use('/auth', authRouter);
router.use('/chat', chatRouter);
router.use('/image', imageRouter);
// const router= app.router('/socket-server')
// router.use('/auth', authRouter);
// router.use('/chat', chatRouter);
// router.use('/image', imageRouter);
// app.use('/socket-server/auth', authRouter);
// app.use('/socket-server/chat', chatRouter);
// app.use('/socket-server/image', imageRouter);


const errorHandler: ErrorRequestHandler = (err, req, res, next) => {};

app.use(errorHandler);
// app.use((err, res) => {
//   console.error(err);
//   res.status(500).send(err);
//   // res.status(err.status).send(err.message)
// });



S3.init();
