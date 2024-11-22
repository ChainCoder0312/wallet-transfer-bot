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
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassowrd = exports.logout = exports.login = void 0;
const jwt = require("jsonwebtoken");
const auth_1 = require("../utils/auth");
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { password = '' } = req.body;
    const isMatch = yield (0, auth_1.verifyPassword)(password);
    // Authenticate user (e.g., check password)
    // This is a simplified example; add actual password checks in real applications
    if (isMatch) {
        const token = jwt.sign({ loggedIn: true }, process.env.JWT_SECRET || 'your_secret_key', { expiresIn: '1h' });
        res.json({ message: 'Login successfully', token });
    }
    else {
        res.status(401).json({ message: 'Invalid password' });
    }
});
exports.login = login;
const logout = (req, res) => {
    // No actual action required here since logout happens client-side
    res.json({ message: 'Logged out successfully' });
};
exports.logout = logout;
const changePassowrd = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        if (newPassword !== confirmPassword)
            return res.status(401).json({ message: 'Check password correctly' });
        const isMatch = yield (0, auth_1.verifyPassword)(currentPassword);
        if (!isMatch)
            return res.status(401).json({ message: "Current password doesn't match" });
        yield (0, auth_1.savePassword)(newPassword);
        res.json({ message: 'Changed password successfully' });
    }
    catch (err) {
        res.status(500).json({ message: 'Server errror' });
    }
});
exports.changePassowrd = changePassowrd;
