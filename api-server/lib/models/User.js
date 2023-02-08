"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const envconfig_1 = require("../envconfig");
const mongoose_1 = require("mongoose");
const bcrypt = require('bcrypt');
const saltRounds = envconfig_1.config.bcrypt.saltRounds;
const user = new mongoose_1.Schema({
    userId: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, required: false },
    userCoin: { type: Number, required: false },
    userProfile: {
        profileImgUrl: { type: String, required: false },
        height: { type: String, required: false },
        weight: { type: String, required: false },
        region: { type: String, required: false },
        gender: { type: String, required: false },
        age: { type: String, required: false },
    },
    refreshToken: { type: String, required: false },
    createdAt: { type: Date, default: Date.now, required: false },
    lastUpdated: { type: Date, required: false },
});
user.pre('save', function (next) {
    const user = this; // userSchema를 가르킴
    if (user.isModified('password')) {
        // password가 변경될 때만 Hashing 실행
        // genSalt: salt 생성
        bcrypt.genSalt(saltRounds, function (err, salt) {
            if (err)
                return next(err);
            bcrypt.hash(user.password, salt, function (err, hashedPassword) {
                // hash의 첫번째 인자: 비밀번호의 Plain Text
                if (err)
                    return next(err);
                user.password = hashedPassword; // 에러없이 성공하면 비밀번호의 Plain Text를 hashedPassword로 교체해줌
                next(); // Hashing이 끝나면 save로 넘어감
            });
        });
    }
    else {
        // password가 변경되지 않을 때
        next(); // 바로 save로 넘어감
    }
});
const User = (0, mongoose_1.model)('user', user);
exports.default = User;
