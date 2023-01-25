import http from 'http';
import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth';
import chatRouter from './routes/chat';
import imageRouter from './routes/image';
// import { sequelize } from './DB/db'
// import socialRoutes from "@colyseus/social/express"
import 'express-async-errors';
import { connectDB, createCollection } from './DB/db';
import { chatController } from './controllers/ChatControllers';
import { Socket } from 'socket.io';
import S3 from './s3';

const mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
const socketPort = Number(process.env.SOCKET_PORT || 5002);
const app = express();
app.use(cookieParser());
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
    'https://www.momstown.site',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    // 'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost',
  ],
  preflightContinue: false,
};

app.use(cors(options));
app.use(express.json());
app.use('/auth', authRouter);
app.use('/chat', chatRouter);
app.use('/image', imageRouter);

app.use((err, res) => {
  console.error(err);
  res.status(500).json({
    status: 500,
    message: `서버 오류: ${err}`,
  });
});

const socketServer = http.createServer(app);
export const io = require('socket.io')(socketServer, {
  path: '/socket/',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
connectDB()
  .then((db) => {
    socketServer.listen(socketPort, () => console.log(`socketServer is running on ${socketPort}`));

    console.log(`Listening on ws://localhost:${socketServer}`);
  })
  .catch(console.error);

export const userMap = new Map<string, Socket>();

io.on('connection', (socket: Socket) => {
  socket.on('whoAmI', (userId) => {
    userMap.set(userId, socket);
  });
  chatController(socket);

  socket.on('disconnect', () => {
    // Todo: delete on userMap.
    console.log('the challenger disconnected');
  });

  socket.on('connect_error', (err) => {
    console.log(`connect_error due to ${err.message}`);
  });
});

socketServer.listen(socketPort, () => console.log(`socketServer is running on ${socketPort}`));
S3.init();
