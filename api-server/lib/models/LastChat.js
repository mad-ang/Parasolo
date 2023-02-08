"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const URD = new mongoose_1.Schema();
const lastchat = new mongoose_1.Schema({
    myInfo: {
        userId: String,
        username: String,
        profileImgUrl: String,
    },
    friendInfo: {
        userId: String,
        username: String,
        profileImgUrl: String,
    },
    message: { type: String, required: false },
    status: { type: Number, required: true },
    roomId: { type: String, required: false },
    unreadCount: { type: Number, required: false },
    updatedAt: { type: Date, default: Date.now, required: false },
});
const LastChat = (0, mongoose_1.model)('lastchat', lastchat);
exports.default = LastChat;
