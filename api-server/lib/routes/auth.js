"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("express-async-errors");
const UserControllers_1 = require("../controllers/UserControllers");
const router = express_1.default.Router();
router.post('/signup', UserControllers_1.signUp);
router.post('/login', UserControllers_1.login);
router.patch('/update', UserControllers_1.updateUserWithAuth);
router.get('/me', UserControllers_1.inquireUser);
router.get('/isAuth', UserControllers_1.authenticateUser);
router.post('/issueAccessToken', UserControllers_1.issueAccessToken);
router.delete('/delete', UserControllers_1.deleteUser);
router.use((err, res) => {
    console.error(err);
    res.status(500).json({
        status: 500,
        message: `서버 오류: ${err}`,
    });
});
exports.default = router;
