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
exports.lookupUser = exports.deleteUser = exports.inquireUser = exports.updateUserWithAuth = exports.updateUserName = exports.updateUser = exports.authenticateUser = exports.issueAccessToken = exports.login = exports.signUp = void 0;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const envconfig_1 = require("../../envconfig");
const AUTH_ERROR = { message: '사용자 인증 오류' };
const User_1 = __importDefault(require("../../models/User"));
require("express-async-errors");
const uuid_1 = require("uuid");
function hashPassword(user) {
    return __awaiter(this, void 0, void 0, function* () {
        const password = user.password;
        const saltRounds = envconfig_1.config.bcrypt.saltRounds;
        const hashedPassword = yield new Promise((resolve, reject) => {
            bcrypt.hash(password, saltRounds, function (err, hash) {
                if (err)
                    reject(err);
                resolve(hash);
            });
        });
        return hashedPassword;
    });
}
const signUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.body;
    if (!user.userId) {
        return res.status(400).json({
            status: 400,
            message: '사용하실 아이디를 입력해주세요.',
        });
    }
    if (!user.password) {
        return res.status(400).json({
            status: 400,
            message: '사용하실 비밀번호를 입력해주세요.',
        });
    }
    const foundUser = yield User_1.default.findOne({ userId: user.userId });
    if (foundUser) {
        return res.status(409).json({
            status: 409,
            message: '이미 존재하는 아이디입니다.',
        });
    }
    user.password = yield hashPassword(user);
    const result = yield User_1.default.collection.insertOne({
        userId: user.userId,
        password: user.password,
        userCoin: 3,
        userProfile: {
            profileImgUrl: '',
            height: '',
            weight: '',
            region: '',
            gender: '',
            age: '',
        },
        createdAt: new Date(),
    });
    if (!result) {
        return res.json({ success: false, message: '회원가입 실패' });
    }
    return res.status(200).json({
        status: 200,
        payload: {
            userId: user.userId,
        },
    });
});
exports.signUp = signUp;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // * Validate user input
    if (!req.body.userId) {
        return res.status(400).json({
            status: 400,
            message: '아이디를 입력해주세요.',
        });
    }
    if (!req.body.password) {
        return res.status(400).json({
            status: 400,
            message: '비밀번호를 입력해주세요.',
        });
    }
    const { userId, password } = req.body;
    const foundUser = yield User_1.default.findOne({ userId: userId });
    if (!foundUser) {
        return res.status(400).json({
            status: 400,
            message: '아이디를 확인해주세요.',
        });
    }
    const isPasswordCorrect = yield bcrypt.compare(password, foundUser.password);
    if (isPasswordCorrect) {
        const accessToken = jwt.sign({
            userId: foundUser.userId,
            username: foundUser.username,
            uuid: (0, uuid_1.v4)(),
        }, envconfig_1.config.jwt.secretKey, {
            expiresIn: '1h',
        });
        const refreshToken = jwt.sign({
            userId: foundUser.userId,
            username: foundUser.username,
            uuid1: (0, uuid_1.v4)(),
            uuid2: (0, uuid_1.v4)(),
        }, envconfig_1.config.jwt.secretKey);
        yield User_1.default.collection.updateOne({ userId: foundUser.userId }, {
            $set: {
                refreshToken: refreshToken,
                lastUpdated: new Date(),
            },
        });
        res.cookie('refreshToken', refreshToken, { path: '/', secure: true }); // 60초 * 60분 * 1시간
        res.status(200).json({
            status: 200,
            payload: {
                userId: foundUser.userId,
                accessToken: accessToken,
            },
        });
    }
    else {
        return res.status(400).json({
            status: 400,
            message: '비밀번호가 올바르지 않습니다.',
        });
    }
});
exports.login = login;
const issueAccessToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { refreshToken } = req.body;
        if (!refreshToken)
            return res.status(401).json(AUTH_ERROR);
        const decoded = yield isRefreshTokenValid(refreshToken);
        if (!decoded)
            return res.status(401).json(AUTH_ERROR);
        const userId = decoded.userId;
        const foundUser = yield User_1.default.findOne({ userId: userId });
        if (!foundUser)
            return res.status(401).json(AUTH_ERROR);
        refreshToken = jwt.sign({
            userId: foundUser.userId,
            username: foundUser.username,
            uuid1: (0, uuid_1.v4)(),
            uuid2: (0, uuid_1.v4)(),
        }, envconfig_1.config.jwt.secretKey);
        yield User_1.default.collection.updateOne({ userId: foundUser.userId }, {
            $set: {
                refreshToken: refreshToken,
                lastUpdated: new Date(),
            },
        });
        const accessToken = jwt.sign({
            userId: foundUser.userId,
            username: foundUser.username,
            uuid: (0, uuid_1.v4)(),
        }, envconfig_1.config.jwt.secretKey, {
            expiresIn: '1h',
        });
        res.cookie('refreshToken', refreshToken, { path: '/', secure: true }); // 60초 * 60분 * 1시간
        return res.status(200).json({
            status: 200,
            payload: {
                userId: foundUser.userId,
                accessToken: accessToken,
            },
        });
    }
    catch (err) {
        res.status(500).json({
            status: 500,
            message: `서버 오류: ${err}`,
        });
    }
});
exports.issueAccessToken = issueAccessToken;
const isAccessTokenValid = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.get('Authorization');
    if (!(authHeader && (authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith('Bearer ')))) {
        return null;
    }
    const token = authHeader.split(' ')[1];
    // 사용자가 주장하는 본인의 토큰 -> id, isAdmin값이 진실인지 아직 모름(위조되었을 수도?)
    return jwt.verify(token, envconfig_1.config.jwt.secretKey, (error, decoded) => __awaiter(void 0, void 0, void 0, function* () {
        // secretKey로 디코딩 및 검증
        if (error)
            return false;
        return decoded;
    }));
});
const isRefreshTokenValid = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    if (!refreshToken)
        return null;
    // 사용자가 주장하는 본인의 토큰 -> id, isAdmin값이 진실인지 아직 모름(위조되었을 수도?)
    return jwt.verify(refreshToken, envconfig_1.config.jwt.secretKey, (error, decoded) => __awaiter(void 0, void 0, void 0, function* () {
        // secretKey로 디코딩 및 검증
        if (error)
            return false;
        return decoded;
    }));
});
const authenticateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const decoded = yield isAccessTokenValid(req, res);
    const userId = decoded.userId;
    const foundUser = yield User_1.default.findOne({ userId: userId });
    if (!foundUser)
        return res.status(401).json(AUTH_ERROR);
    return res.status(200).json({
        status: 200,
        payload: {
            userId: userId,
        },
    });
});
exports.authenticateUser = authenticateUser;
const updateUser = (userId, userProfile) => __awaiter(void 0, void 0, void 0, function* () {
    if (!userProfile)
        return;
    const keys = Object.keys(userProfile);
    keys === null || keys === void 0 ? void 0 : keys.forEach((key) => {
        var _a;
        if (!userProfile[key] || ((_a = userProfile[key]) === null || _a === void 0 ? void 0 : _a.length) === 0) {
            delete userProfile[key];
        }
    });
    User_1.default.collection
        .updateOne({ userId: userId }, {
        $set: {
            userProfile: userProfile,
        },
    })
        .then(() => {
        console.log('DB 업데이트', userId, userProfile);
        console.log('successfully updated');
    })
        .catch(function (error) {
        console.log(error);
    });
});
exports.updateUser = updateUser;
const updateUserName = (userId, username) => __awaiter(void 0, void 0, void 0, function* () {
    User_1.default.collection
        .updateOne({ userId: userId }, {
        $set: {
            username: username,
        },
    })
        .then(() => {
        console.log('DB 업데이트', userId, username);
        console.log('successfully updated');
    })
        .catch(function (error) {
        console.log(error);
    });
});
exports.updateUserName = updateUserName;
const updateUserWithAuth = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const decoded = yield isAccessTokenValid(req, res);
    if (!decoded)
        return res.status(401).json(AUTH_ERROR);
    const previousUserId = decoded.userId;
    const newUserData = req.body;
    if (newUserData.password) {
        newUserData.password = yield hashPassword(newUserData);
    }
    newUserData.lastUpdated = new Date();
    //  TODO: 한 뎁스 더 들어가서 userProfile 변경시키는 쿼리 확인하기
    User_1.default.collection
        .updateOne({ userId: previousUserId }, {
        $set: {
            userProfile: newUserData.userProfile,
        },
    })
        .then(() => {
        if (newUserData.password) {
            delete newUserData.password;
        }
        return res.status(200).json({
            status: 200,
            payload: newUserData,
        });
    })
        .catch(function (error) {
        return res.status(500).json({
            status: 404,
            message: '사용자 정보 변경에 실패했습니다.',
        });
    });
});
exports.updateUserWithAuth = updateUserWithAuth;
const inquireUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const decoded = yield isAccessTokenValid(req, res);
    if (!decoded)
        return res.status(401).json(AUTH_ERROR);
    const userId = decoded.userId;
    const foundUser = yield User_1.default.findOne({ userId: userId });
    if (foundUser) {
        return res.status(200).json({
            status: 200,
            payload: {
                userId: foundUser.userId,
                username: foundUser.username,
                userCoin: foundUser.userCoin,
                userProfile: foundUser.userProfile,
            },
        });
    }
    return res.status(404).json({
        status: 404,
        message: '조회에 실패했습니다.',
    });
});
exports.inquireUser = inquireUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const decoded = yield isAccessTokenValid(req, res);
    if (!decoded)
        return res.status(401).json(AUTH_ERROR);
    const previousUserId = decoded.userId;
    User_1.default.collection
        .deleteOne({ userId: previousUserId })
        .then(() => {
        return res.status(200).json({
            status: 200,
            payload: {
                userId: previousUserId,
            },
        });
    })
        .catch(function (error) {
        return res.status(404).json({
            status: 404,
            message: '삭제에 실패했습니다.',
        });
    });
});
exports.deleteUser = deleteUser;
const lookupUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.body;
    const result = [];
    // User.collection.findOne().then((uesr)=>{
    //   result.push(user.userId)
    // })
});
exports.lookupUser = lookupUser;
