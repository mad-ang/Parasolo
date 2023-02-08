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
const socketPort = 3001
export const userMap = new Map<string, Socket>();
export const io = new Server(socketPort,{
  cors: {
    allowedHeaders: [
          'Origin',
          'X-Requested-With',
          'Content-Type',
          'Accept',
          'X-Access-Token',
          'authorization',
        ],
    origin: ['https://www.para-solo.site', 'http://www.para-solo.site'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
io.on("connect_error", (err) => {
  console.log(`connect_error due to ${err.message}`);
});
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
  // socketServer.listen(socketPort);
  
  console.log(`Listening on wss://localhost:${socketPort}`);
})
.catch(console.error);

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {};

S3.init();
