import { Router } from "express";

// import baccaratRouter from "./baccarat";
import authRouter from './auth.route';
import tokenRouter from './token.route';
import walletRouter from './wallet.route';
import { Bot } from "../bot/bot";
import { authenticate } from "../middleware/auth";
import { fetchLogs } from '../controllers/log.crtl';





export default (bot: Bot) => {
  const router = Router();

  router.use("/auth", authRouter);
  router.use('/token', tokenRouter(bot));
  router.use('/wallet', walletRouter(bot));
  router.post('/logs', authenticate, fetchLogs);
  return router;
};
