"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const LastChatControllers_1 = require("../controllers/LastChatControllers");
const router = express_1.default.Router();
// router.get('/chat', chatController)
router.post('/roomList', LastChatControllers_1.loaddata);
router.post('/addFriend', LastChatControllers_1.firstdata);
router.post('/acceptFriend', LastChatControllers_1.setfriend);
router.post('/chargingCoin', LastChatControllers_1.chargingCoin);
exports.default = router;
