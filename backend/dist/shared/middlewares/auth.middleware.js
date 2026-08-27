"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyResetToken = exports.verifyAccessToken = exports.verifySetupToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_sobanhang';
const verifySetupToken = (req, res, next) => {
    const token = req.cookies.setupToken || req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Không tìm thấy token cài đặt (setupToken)' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (decoded.scope !== 'setup') {
            return res.status(403).json({ error: 'Token không hợp lệ cho tác vụ này' });
        }
        req.user = {
            userId: decoded.userId,
            scope: decoded.scope
        };
        next();
    }
    catch (error) {
        return res.status(401).json({ error: 'Token cài đặt đã hết hạn hoặc không hợp lệ' });
    }
};
exports.verifySetupToken = verifySetupToken;
const verifyAccessToken = (req, res, next) => {
    const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Chưa đăng nhập' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (decoded.scope !== 'access') {
            return res.status(403).json({ error: 'Token không hợp lệ' });
        }
        req.user = {
            userId: decoded.userId,
            role: decoded.role,
            scope: decoded.scope,
            storeId: decoded.storeId
        };
        next();
    }
    catch (error) {
        return res.status(401).json({ error: 'Phiên đăng nhập hết hạn' });
    }
};
exports.verifyAccessToken = verifyAccessToken;
const verifyResetToken = (req, res, next) => {
    const token = req.cookies.resetToken || req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Vui lòng xác minh mã OTP trước' });
    }
    jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Token đã hết hạn, vui lòng xin lại mã OTP' });
        }
        req.user = decoded;
        next();
    });
};
exports.verifyResetToken = verifyResetToken;
