"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_crtl_1 = require("../controllers/auth.crtl");
const auth_1 = require("../middleware/auth"); // Ensure authenticate is typed correctly
const authRouter = (0, express_1.Router)();
authRouter.post('/login', auth_crtl_1.login);
authRouter.post('/logout', auth_1.authenticate, auth_crtl_1.logout);
authRouter.post('/change_password', auth_1.authenticate, auth_crtl_1.changePassowrd);
exports.default = authRouter;
