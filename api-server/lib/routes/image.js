"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ImageControllers_1 = require("../controllers/ImageControllers");
const router = express_1.default.Router();
router.put('/getPresignedUploadUrl', ImageControllers_1.getUrlToUpload);
exports.default = router;
