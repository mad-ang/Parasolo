"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const chat = new mongoose_1.Schema({
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    content: { type: String, required: false },
    createdAt: { type: Date, default: Date.now, required: false },
});
const Chat = (0, mongoose_1.model)('chat', chat);
exports.default = Chat;
