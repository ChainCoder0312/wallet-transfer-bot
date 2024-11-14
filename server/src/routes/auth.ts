import { RequestHandler, Router } from 'express';
import { changePassowrd, login, logout } from '../controllers/auth';
import { authenticate } from '../middleware/auth'; // Ensure authenticate is typed correctly

const authRouter = Router();

authRouter.post('/login', login);
authRouter.post('/logout', authenticate, logout);
authRouter.post('/change_password', authenticate, changePassowrd as RequestHandler);


export default authRouter;