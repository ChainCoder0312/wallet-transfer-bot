import { RequestHandler, Router } from 'express';
import { authenticate } from '../middleware/auth'; // Ensure authenticate is typed correctly
import { fetch, getPrivateKey, saveData } from '../controllers/wallet.crtl';
import { Bot } from '../bot/bot';




export default (bot: Bot) => {
  const walletRouter = Router();
  walletRouter.get('/fetch', authenticate, fetch as RequestHandler);
  walletRouter.post('/privateKey', authenticate, getPrivateKey as RequestHandler);
  walletRouter.post('/save', authenticate, saveData(bot) as RequestHandler);
  return walletRouter;
};