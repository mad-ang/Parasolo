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
exports.checkLast = exports.getLastChat = exports.updateUnread = exports.updateRoomId = exports.updateLastChat = exports.updateRoomImg = exports.updateRoomStatus = exports.setfriend = exports.chargingCoin = exports.firstdata = exports.loaddata = void 0;
const __1 = require("../..");
const LastChat_1 = __importDefault(require("../../models/LastChat"));
const type_1 = require("./type");
const User_1 = __importDefault(require("../../models/User"));
const time_diff = 9 * 60 * 60 * 1000;
const loaddata = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.body;
    if (!user.userId)
        return res.status(404).json({
            status: 404,
            message: 'not found',
        });
    (0, exports.getLastChat)(user.userId)
        .then((result) => {
        console.log(result);
        res.status(200).json({
            status: 200,
            payload: result,
        });
    })
        .catch((error) => {
        console.error(error);
        return res.status(500).json({
            status: 500,
            message: '서버 오류',
        });
    });
});
exports.loaddata = loaddata;
const firstdata = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.body;
    if (!user) {
        return res.status(404).json({
            status: 404,
            message: 'not found',
        });
    }
    if (!(user.myInfo && user.friendInfo && user.message)) {
        return res.status(400).json({
            status: 400,
            message: 'invalid input',
        });
    }
    addLastChat({
        myInfo: user.myInfo,
        friendInfo: user.friendInfo,
        status: user.status,
        message: user.message,
    })
        .then((result) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        // 만약 이미 친구였다면 false가 오고, 이제 새로 친구를 요청했다면 true가 온다
        if (result) {
            // 친구 요청을 보낸 사람의 코인을 1개 차감한다
            const userId = user.myInfo.userId;
            // DB에서 이 유저의 userCoin을 찾아온다
            const foundUser = yield User_1.default.findOne({
                userId: userId,
            });
            if (!foundUser || (foundUser === null || foundUser === void 0 ? void 0 : foundUser.userCoin) === undefined) {
                return res.status(400).json({
                    status: 400,
                    message: '유효한 사용자가 아닙니다.',
                });
            }
            // 만약에 유저코인이 0이면 리턴 404
            if (foundUser.userCoin <= 0) {
                return res.status(200).json({
                    status: 404,
                    message: '코인이 부족합니다.',
                });
            }
            User_1.default.collection.updateOne({ userId: userId }, {
                $inc: {
                    userCoin: -1,
                },
            });
            (_a = __1.userMap.get(user.friendInfo.userId)) === null || _a === void 0 ? void 0 : _a.emit('request-friend', user.myInfo);
            return res.status(200).json({
                status: 200,
                payload: {
                    myInfo: user.myInfo,
                    friendInfo: user.friendInfo,
                },
            });
        }
        else
            res.status(200).json({
                status: 409,
                message: 'already exist',
            });
    }))
        .catch((err) => {
        console.error(err);
        res.status(500).json({
            status: 500,
            message: `서버 오류: ${err}`,
        });
    });
});
exports.firstdata = firstdata;
const chargingCoin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // 유효성검사 필요할 듯
    const user = req.body;
    const userId = user.myInfo.userId; // DB에서 이 유저의 userCoin을 찾아온다
    const foundUser = yield User_1.default.findOne({
        userId: userId,
    })
        .then(() => __awaiter(void 0, void 0, void 0, function* () {
        //코인충전 3개
        User_1.default.collection.updateOne({ userId: userId }, {
            $inc: {
                userCoin: 3,
            },
        });
        res.status(200).json({
            status: 200,
            message: '코인이 충전되었습니다',
            payload: {
                myInfo: user.myInfo,
                friendInfo: user.friendInfo,
            },
        });
    }))
        .catch((err) => {
        //에러
        console.error(err);
        res.status(500).json({
            status: 500,
            message: `서버 오류: ${err}`,
        });
    });
});
exports.chargingCoin = chargingCoin;
// if (!user) {
//   return res.status(404).json({
//     status: 404,
//     message: 'not found',
//   });
// }
// if (!(user.myInfo && user.friendInfo && user.message)) {
//   return res.status(400).json({
//     status: 400,
//     message: 'invalid input',
//   });
// }
// if (!foundUser || foundUser?.userCoin === undefined) {
//   return res.status(400).json({
//     status: 400,
//     message: '유효한 사용자가 아닙니다.',
//   });
// }
const setfriend = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { myInfo, friendInfo, isAccept } = req.body;
    if (!myInfo || !friendInfo)
        return res.status(404).send('not found');
    acceptFriend({ myId: myInfo.userId, friendId: friendInfo.userId, isAccept: isAccept }).then((resultStatus) => {
        var _a;
        res.status(200).json({
            status: 200,
            payload: {
                resultStatus: resultStatus,
                myInfo: myInfo,
                friendInfo: friendInfo,
            },
        });
        //for alarm
        (_a = __1.userMap.get(friendInfo.friendId)) === null || _a === void 0 ? void 0 : _a.emit('accept-friend', myInfo.username);
        // res.status(200).send(resultStatus)
    });
});
exports.setfriend = setfriend;
const addLastChat = (obj) => __awaiter(void 0, void 0, void 0, function* () {
    let cur_date = new Date();
    let utc = cur_date.getTime() + cur_date.getTimezoneOffset() * 60 * 1000;
    let createAt = utc + time_diff;
    if (obj.myInfo.userId === obj.friendInfo.userId)
        return false;
    const alreadyFriend = yield (0, exports.checkLast)(obj.myInfo.userId, obj.friendInfo.userId);
    try {
        if (alreadyFriend) {
            return false;
        }
        // 이제 처음 친구 요청한 경우
        LastChat_1.default.collection.insertOne({
            myInfo: obj.myInfo,
            friendInfo: obj.friendInfo,
            status: obj.status,
            message: obj.message,
            roomId: 'start',
            unreadCount: 0,
            updatedAt: createAt,
        });
        LastChat_1.default.collection.insertOne({
            myInfo: obj.friendInfo,
            friendInfo: obj.myInfo,
            status: obj.status,
            message: obj.message,
            roomId: 'start',
            unreadCount: 1,
            updatedAt: createAt,
        });
        console.log('in addLastChatresult');
        return true;
    }
    catch (err) {
        console.error(err);
    }
});
const acceptFriend = (obj) => __awaiter(void 0, void 0, void 0, function* () {
    const { myId, friendId, isAccept } = obj;
    let status = type_1.IChatRoomStatus.SOCKET_OFF;
    if (!isAccept) {
        status = type_1.IChatRoomStatus.REJECTED;
    }
    yield (0, exports.updateRoomStatus)({ myId, friendId, status, isAccept });
    return status;
});
const updateRoomStatus = (obj) => __awaiter(void 0, void 0, void 0, function* () {
    const { myId, friendId, status, isAccept } = obj;
    console.log('updateRoomStatus', obj);
    if (!isAccept) {
        LastChat_1.default.collection.deleteOne({ $and: [{ 'myInfo.userId': myId }, { 'friendInfo.userId': friendId }] });
        LastChat_1.default.collection.deleteOne({ $and: [{ 'friendInfo.userId': myId }, { 'myInfo.userId': 0 }] });
        return;
    }
    yield LastChat_1.default.collection.findOneAndUpdate({ $and: [{ 'myInfo.userId': myId }, { 'friendInfo.userId': friendId }] }, { $set: { status: status } });
    yield LastChat_1.default.collection.findOneAndUpdate({ $and: [{ 'myInfo.userId': friendId }, { 'friendInfo.userId': myId }] }, { $set: { status: status } });
});
exports.updateRoomStatus = updateRoomStatus;
const updateRoomImg = (userId, profileImgUrl) => __awaiter(void 0, void 0, void 0, function* () {
    yield LastChat_1.default.collection.findAndModify({ 'friendInfo.userId': userId }, { $set: { 'friendInfo.profileImgUrl': profileImgUrl } });
    yield LastChat_1.default.collection.findAndModify({ 'myInfo.userId': userId }, { $set: { 'myInfo.profileImgUrl': profileImgUrl } });
});
exports.updateRoomImg = updateRoomImg;
const deleteChatRoom = (obj) => __awaiter(void 0, void 0, void 0, function* () {
    const { myId, friendId } = obj;
    let docs = yield LastChat_1.default.collection.findOne({
        $and: [{ 'myInfo.userId': myId }, { 'friendInfo.userId': friendId }],
    });
    // 삭제한 상대방에게 상대방이 채팅방에서 나갔음을 알림.
});
const updateLastChat = (obj) => __awaiter(void 0, void 0, void 0, function* () {
    const { myId, friendId, message } = obj;
    let cur_date = new Date();
    let utc = cur_date.getTime() + cur_date.getTimezoneOffset() * 60 * 1000;
    let createAt = utc + time_diff;
    yield LastChat_1.default.collection.findOneAndUpdate({ $and: [{ 'myInfo.userId': myId }, { 'friendInfo.userId': friendId }] }, { $set: { message: message, updatedAt: createAt } });
    let docs = yield LastChat_1.default.collection.findOneAndUpdate({ $and: [{ 'myInfo.userId': friendId }, { 'friendInfo.userId': myId }] }, { $set: { message: message, updatedAt: createAt }, $inc: { unreadCount: 1 } });
});
exports.updateLastChat = updateLastChat;
const updateRoomId = (obj) => __awaiter(void 0, void 0, void 0, function* () {
    const { myId, friendId, roomId } = obj;
    console.log(obj);
    LastChat_1.default.collection.findOneAndUpdate({ $and: [{ 'myInfo.userId': myId }, { 'friendInfo.userId': friendId }] }, { $set: { roomId: roomId, unreadCount: 0 } });
    LastChat_1.default.collection.findOneAndUpdate({ $and: [{ 'myInfo.userId': friendId }, { 'friendInfo.userId': myId }] }, { $set: { roomId: roomId } });
});
exports.updateRoomId = updateRoomId;
const updateUnread = (obj) => __awaiter(void 0, void 0, void 0, function* () {
    const { myId, friendId } = obj;
    LastChat_1.default.collection.findOneAndUpdate({ $and: [{ 'myInfo.userId': myId }, { 'friendInfo.userId': friendId }] }, { $set: { unreadCount: 0 } });
});
exports.updateUnread = updateUnread;
const getLastChat = (myId) => __awaiter(void 0, void 0, void 0, function* () {
    let result = new Array();
    try {
        yield LastChat_1.default.collection
            .find({ 'myInfo.userId': myId })
            .sort({ _id: -1 })
            .toArray()
            .then((elem) => {
            elem.forEach((json) => {
                result.push(json);
            });
        });
        return result;
    }
    catch (err) {
        console.error(err);
    }
});
exports.getLastChat = getLastChat;
const checkLast = (myId, friendId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const res = yield LastChat_1.default.collection.count({
            $and: [{ 'myInfo.userId': myId }, { 'friendInfo.userId': friendId }],
        });
        return res;
    }
    catch (err) {
        console.error(err);
    }
});
exports.checkLast = checkLast;
