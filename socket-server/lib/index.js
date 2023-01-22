"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userMap = exports.io = void 0;
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = __importDefault(require("./routes/auth"));
const chat_1 = __importDefault(require("./routes/chat"));
const image_1 = __importDefault(require("./routes/image"));
// import socialRoutes from "@colyseus/social/express"
require("express-async-errors");
const ChatControllers_1 = require("./controllers/ChatControllers");
const s3_1 = __importDefault(require("./s3"));
const mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
const socketPort = Number(process.env.SOCKET_PORT || 5002);
const app = (0, express_1.default)();
app.use(cookieParser());
const options = {
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
        'http://localhost:5173',
        'http://localhost:5174',
    ],
    preflightContinue: false,
};
app.use((0, cors_1.default)(options));
app.use(express_1.default.json());
app.use('/auth', auth_1.default);
app.use('/chat', chat_1.default);
app.use('/image', image_1.default);
app.use((err, res) => {
    console.error(err);
    res.status(500).json({
        status: 500,
        message: `서버 오류: ${err}`,
    });
});
const socketServer = http_1.default.createServer(app);
exports.io = require('socket.io')(socketServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});
exports.userMap = new Map();
exports.io.on('connection', (socket) => {
    socket.on('whoAmI', (userId) => {
        exports.userMap.set(userId, socket);
    });
    (0, ChatControllers_1.chatController)(socket);
    socket.on('disconnect', () => {
        // Todo: delete on userMap.
        console.log('the challenger disconnected');
    });
});
socketServer.listen(socketPort, () => console.log(`socketServer is running on ${socketPort}`));
s3_1.default.init();
