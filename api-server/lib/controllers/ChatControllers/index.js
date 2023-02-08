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
exports.getChatMessage = exports.addChatMessage = exports.chatController = void 0;
const Chat_1 = __importDefault(require("../../models/Chat"));
const uuid_1 = require("uuid");
const LastChatControllers_1 = require("../LastChatControllers");
const __1 = require("../..");
const LastChat_1 = __importDefault(require("../../models/LastChat"));
const rooms = {};
const time_diff = 9 * 60 * 60 * 1000;
const createRoom = () => {
    const roomId = (0, uuid_1.v4)();
    rooms[roomId] = [];
    // rooms_chat[roomId] = [];
    console.log('chatroom[', roomId, '] created.');
    return roomId;
};
const chatController = (socket) => {
    const joinRoom = (host) => {
        let { roomId } = host;
        const { userId, friendId } = host;
        if (rooms[roomId]) {
            console.log('user Joined the room', roomId, userId);
            rooms[roomId].push(userId);
            (0, LastChatControllers_1.updateUnread)({ myId: userId, friendId: friendId });
            socket.join(roomId);
        }
        else {
            roomId = createRoom();
            (0, LastChatControllers_1.updateRoomId)({ myId: userId, friendId: friendId, roomId: roomId }).then(() => {
                var _a;
                (_a = __1.userMap.get(friendId)) === null || _a === void 0 ? void 0 : _a.emit('updata-room-id');
                rooms[roomId].push(userId);
            });
        }
        readMessage({ roomId, userId, friendId });
        socket.on('disconnect', () => {
            console.log('user left the room', host);
            leaveRoom({ roomId, userId: userId, friendId });
        });
    };
    const leaveRoom = ({ roomId, userId: userId, friendId: guestId }) => {
        rooms[roomId] = rooms[roomId].filter((id) => id !== userId);
        socket.to(roomId).emit('user-disconnected', userId);
    };
    const startChat = ({ roomId, userId: userId, friendId: guestId }) => {
        socket.to(roomId).emit('uesr-started-chat', userId);
    };
    const stopChat = (roomId) => {
        socket.to(roomId).emit('user-stopped-chat');
    };
    const sendMessage = (obj) => {
        var _a;
        const { roomId, userId, friendId, message } = obj;
        if (message) {
            // console.log(rooms_chat[roomId]);
            // rooms_chat[roomId].push(message);
            (0, exports.addChatMessage)({ senderId: userId, receiverId: friendId, message: message });
            (0, LastChatControllers_1.updateLastChat)({ myId: userId, friendId: friendId, message: message });
            console.log(userId, ' to ', friendId, ' : ', message);
            // io.to(roomId).except(socket.id).emit('message', obj)
            (_a = __1.userMap.get(friendId)) === null || _a === void 0 ? void 0 : _a.emit('message', obj);
        }
    };
    // room이 살아 있을 경우.
    // Array를 만들고 거기에 푸쉬. Array를 만들어서 룸 데이터로 가지고 있는다.
    // 메시지를 읽으려 할때 그 array를 리턴.
    // room에 처음 참여하는 경우는 db에서 불러온 값을 그대로 보여줌.
    const readMessage = (message) => {
        const { roomId, userId, friendId } = message;
        // if (rooms_chat[roomId]) {
        //   socket.to(roomId).emit('show-messages', rooms_chat[roomId]);
        // } else {
        console.log('check readMessage');
        (0, exports.getChatMessage)(userId, friendId)
            .then((chatMessage) => {
            console.log('chatroomId after getChatMessage:', roomId);
            // rooms_chat[roomId].push(chatMessage)
            // console.log(rooms_chat[roomId]);
            // socket.to(roomId).emit('show-messages', chatMessage);
            socket.emit('old-messages', chatMessage);
        })
            .catch((error) => {
            console.log(error);
        });
    };
    // }
    // socket.on("create-room", createRoom);
    socket.on('join-room', joinRoom);
    // socket.on('start-chat', startChat);
    // socket.on('stop-chat', stopChat);
    // socket.on('show-messages', readMessage);
    socket.on('message', sendMessage);
};
exports.chatController = chatController;
// join-room
// show-messages
// message
const addChatMessage = (message) => {
    let cur_date = new Date();
    let utc = cur_date.getTime() + cur_date.getTimezoneOffset() * 60 * 1000;
    let createAt = utc + time_diff;
    Chat_1.default.collection.insertOne({
        senderId: message.senderId,
        receiverId: message.receiverId,
        message: message.message,
        createdAt: createAt,
    });
    console.log('in addChatresult', createAt);
};
exports.addChatMessage = addChatMessage;
const getChatMessage = (sender, recipient) => __awaiter(void 0, void 0, void 0, function* () {
    let result = new Array();
    yield Chat_1.default.collection
        .find({
        $or: [
            { $and: [{ senderId: sender }, { receiverId: recipient }] },
            { $and: [{ senderId: recipient }, { receiverId: sender }] },
        ],
    })
        .limit(200)
        .sort({ _id: 1 })
        .toArray()
        .then((elem) => {
        elem.forEach((json) => {
            result.push(json);
        });
    });
    LastChat_1.default.collection.find();
    return result;
});
exports.getChatMessage = getChatMessage;
