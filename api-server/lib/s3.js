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
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const envconfig_1 = require("./envconfig");
const { bucketName, bucketRegion, identityPoolId, accessKeyId, secretAccessKey } = envconfig_1.config.aws;
// import { updateUserInfo } from './auth';
class _S3 {
    constructor() {
        this.bucketName = null;
        this.bucketRegion = null;
        this.identityPoolId = null;
        this.accessKeyId = null;
        this.secretAccessKey = null;
        this.s3 = null;
    }
    init() {
        // this = S3 화살표함수의 this는 그 상위객체에 바인딩됨 (S3)
        try {
            if (!bucketName || !identityPoolId)
                throw '환경변수를 확인해주세요';
            this.bucketName = bucketName;
            this.bucketRegion = bucketRegion;
            this.identityPoolId = identityPoolId;
            this.accessKeyId = accessKeyId;
            this.secretAccessKey = secretAccessKey;
            aws_sdk_1.default.config.update({
                accessKeyId: this.accessKeyId,
                secretAccessKey: this.secretAccessKey,
                region: this.bucketRegion,
            });
            this.s3 = new aws_sdk_1.default.S3();
        }
        catch (error) {
            console.log(error);
        }
    }
    getPresignedUploadUrl(photoKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = yield this.s3.getSignedUrl('putObject', {
                Bucket: this.bucketName,
                Key: `${photoKey}`,
                ContentType: 'image/*',
                Expires: 300,
            });
            return url;
        });
    }
}
const S3 = new _S3();
exports.default = S3;
