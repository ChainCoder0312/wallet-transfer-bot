import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { savePassword, verifyPassword } from '../utils/auth';



export const login = async (req: Request, res: Response) => {

  const { password = '' } = req.body;
  const isMatch = await verifyPassword(password);

  // Authenticate user (e.g., check password)
  // This is a simplified example; add actual password checks in real applications
  if (isMatch) {
    const token = jwt.sign({ loggedIn: true }, process.env.JWT_SECRET || 'your_secret_key', { expiresIn: '1h' });

    res.json({ message: 'Login successfully', token });
  } else {
    res.status(401).json({ message: 'Invalid password' });
  }
};

export const logout = (req: Request, res: Response) => {
  // No actual action required here since logout happens client-side
  res.json({ message: 'Logged out successfully' });
};

export const changePassowrd = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) return res.status(401).json({ message: 'Check password correctly' });

    const isMatch = await verifyPassword(currentPassword);
    if (!isMatch) return res.status(401).json({ message: "Current password doesn't match" });

    await savePassword(newPassword);


    res.json({ message: 'Changed password successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server errror' });
  }
};