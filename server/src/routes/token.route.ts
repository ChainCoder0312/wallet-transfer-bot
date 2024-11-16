import { RequestHandler, Router } from 'express';
import { add, fetch } from '../controllers/token.crtl';
import { authenticate } from '../middleware/auth'; // Ensure authenticate is typed correctly
import { Bot } from '../bot/bot';




export default (bot: Bot) => {
  const tokenRouter = Router();

  tokenRouter.post('/add', authenticate, add(bot) as RequestHandler);
  tokenRouter.get('/fetch', authenticate, fetch as RequestHandler);
  return tokenRouter;
};