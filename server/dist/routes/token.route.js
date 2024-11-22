"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const token_crtl_1 = require("../controllers/token.crtl");
const auth_1 = require("../middleware/auth"); // Ensure authenticate is typed correctly
exports.default = (bot) => {
    const tokenRouter = (0, express_1.Router)();
    tokenRouter.post('/add', auth_1.authenticate, (0, token_crtl_1.add)(bot));
    tokenRouter.get('/fetch', token_crtl_1.fetch);
    return tokenRouter;
};
