import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user-model';

const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header('Authorization')?.replace('Bearer ', '') as string;
  const secret = process.env.JWT_SECRET as string;

  try {
    const decoded = jwt.verify(token, secret) as { _id: string };

    const user = await User.findById(decoded._id).select('-password');

    if (!user) {
      return res.status(401).json({
        error: 'Login required',
      });
    }

    if (!user.confirmed) {
      return res.status(401).json({
        error: 'Account has not been confirmed',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};

export { isAuthenticated };
