"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth"); // Ensure authenticate is typed correctly
const wallet_crtl_1 = require("../controllers/wallet.crtl");
exports.default = (bot) => {
    const walletRouter = (0, express_1.Router)();
    walletRouter.get('/fetch', auth_1.authenticate, wallet_crtl_1.fetch);
    walletRouter.post('/privateKey', auth_1.authenticate, wallet_crtl_1.getPrivateKey);
    walletRouter.post('/save', auth_1.authenticate, (0, wallet_crtl_1.saveData)(bot));
    return walletRouter;
};
