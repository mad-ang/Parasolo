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
exports.getUrlToUpload = void 0;
const s3_1 = __importDefault(require("../../s3"));
const getUrlToUpload = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { photoKey } = req.body;
        const url = yield s3_1.default.getPresignedUploadUrl(photoKey);
        if (!url) {
            res.header('Access-Control-Allow-Origin', '*');
            return res.status(404).json({
                status: 404,
                message: '이미지 저장소를 찾을 수 없습니다.',
            });
        }
        res.status(200).json({
            status: 200,
            payload: {
                url: url,
            },
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 500,
            message: '서버 오류',
        });
    }
});
exports.getUrlToUpload = getUrlToUpload;
