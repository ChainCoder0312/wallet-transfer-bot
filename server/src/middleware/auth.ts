import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

export const authenticate = (req: Request, res: Response, next: NextFunction): any => {
  const token = req.headers.authorization;

  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.decode(token);
    // req.user = decoded;  // Attach decoded token payload to request object
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};