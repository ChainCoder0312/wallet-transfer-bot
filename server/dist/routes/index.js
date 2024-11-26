"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// import baccaratRouter from "./baccarat";
const auth_route_1 = require("./auth.route");
const token_route_1 = require("./token.route");
const wallet_route_1 = require("./wallet.route");
const auth_1 = require("../middleware/auth");
const log_crtl_1 = require("../controllers/log.crtl");
exports.default = (bot) => {
    const router = (0, express_1.Router)();
    router.use("/auth", auth_route_1.default);
    router.use('/token', (0, token_route_1.default)(bot));
    router.use('/wallet', (0, wallet_route_1.default)(bot));
    router.post('/logs', auth_1.authenticate, log_crtl_1.fetchLogs);
    return router;
};
