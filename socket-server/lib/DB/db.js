"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCollection = exports.connectDB = void 0;
const envconfig_1 = require("../envconfig");
const Chat_1 = __importDefault(require("../models/Chat"));
const LastChat_1 = __importDefault(require("../models/LastChat"));
const User_1 = __importDefault(require("../models/User"));
const mongoose = require('mongoose');
function connectDB() {
    return __awaiter(this, void 0, void 0, function* () {
        mongoose.set('strictQuery', false);
        mongoose.connect(envconfig_1.config.db.host, {
            dbName: 'momstown',
            useNewUrlParser: true,
        });
        (0, exports.createCollection)('user');
        (0, exports.createCollection)('chat');
        (0, exports.createCollection)('lastchat');
    });
}
exports.connectDB = connectDB;
const createCollection = (modelName) => {
    if (mongoose.modelNames().includes(modelName)) {
        return mongoose.model(modelName);
    }
    switch (modelName) {
        case 'user':
            new User_1.default();
            break;
        case 'chat':
            new Chat_1.default();
            break;
        case 'lastchat':
            new LastChat_1.default();
            break;
    }
};
exports.createCollection = createCollection;
