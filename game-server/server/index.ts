import http from 'http';
import express from 'express';
import cors from 'cors';
import { Server, LobbyRoom } from 'colyseus';
import { monitor } from '@colyseus/monitor';
import { RoomType } from '../types/Rooms';
// import { sequelize } from './DB/db'
// import socialRoutes from "@colyseus/social/express"
import 'express-async-errors';
import { ParaSolo } from './rooms/ParaSolo';
import { connectDB } from './DB/db';
import S3 from './s3';

const mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
const port = Number(process.env.PORT || 8080);
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

const server = http.createServer(app);
const gameServer = new Server({
  server,
});

gameServer.define(RoomType.LOBBY, LobbyRoom);
gameServer.define(RoomType.PUBLIC, ParaSolo, {
  name: '파라솔로에 들어가기전',
  description: '아바타를 골라보아요.',
  password: null,
  autoDispose: false,
});
connectDB()
  .then((db) => {
    gameServer.listen(port);

    console.log(`Listening on ws://localhost:${port}`);
  })
  .catch(console.error);
  //@ts-ignore
  app.use((err, res) => {
    console.error(err);
    res.status(500).send(err);
    // res.status(err.status).send(err.message)
  });
  //@ts-ignore
  // app.use(function(err, req, res, next) {
  //   res.status(err.status || 500);
  //   next(err);
  //   res.render('error', {
  //   message: err.message,
  //   error: {}
  //   });
  // });
S3.init();
