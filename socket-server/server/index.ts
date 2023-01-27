import http, { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import type { ErrorRequestHandler } from "express";
import 'express-async-errors';
import { connectDB } from './DB/db';
import { chatController } from './controllers/ChatControllers';
import { Socket, Server } from 'socket.io';
import S3 from './s3';
var cookieParser = require('cookie-parser');




const socketPort = Number(process.env.SOCKET_PORT || 3000);
const app = express();
app.use(cookieParser())

// const options: cors.CorsOptions = {
//   allowedHeaders: [
//     'Origin',
//     'X-Requested-With',
//     'Content-Type',
//     'Accept',
//     'X-Access-Token',
//     'authorization',
//   ],
//   credentials: true,
//   methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
//   origin: [
//     'https://www.para-solo.site',
//     'http://www.para-solo.site',
//     'http://localhost:5173',
//     'http://localhost:5174',
//     `http://3.39.240.238`,
//   ],
//   preflightContinue: false,
// };

// app.use(cors(options));
// app.use(express.json());
const socketServer = http.createServer(app);

const httpServer = createServer();
export const userMap = new Map<string, Socket>();
export const io = require('socket.io')(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
// io.attach('https://www.para-solo.site');
// export const io = new Server({
//   path: '/socket/',
//   cors: {
//     origin: ['https://www.para-solo.site', 'http://www.para-solo.site'],
//     // methods: ['GET', 'POST'],
//     // credentials: true,
//   },
// });
// io.on("connect_error", (err) => {
//   console.log(`connect_error due to ${err.message}`);
// });
io.on('connection', (socket: Socket) => {
  socket.on('whoAmI', (userId) => {
    console.log(userId, "logined in socket-server.")
    userMap.set(userId, socket);
  });
  console.log('connection');
  chatController(socket);

  socket.on('disconnect', () => {
    // Todo: delete on userMap.
    console.log('the challenger disconnected');
  });

  socket.on('connect_error', (err) => {
    console.log(`connect_error due to ${err.message}`);
  });
});

connectDB()
.then((db) => {
  io.listen(socketPort);
  
  console.log(`Listening on wss://localhost:${socketPort}`);
})
.catch(console.error);
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {};

app.use(errorHandler);

S3.init();
