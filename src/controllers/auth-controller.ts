import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user-model';

const signin = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    
    if (!user) {
      return res.status(401).json({
        error: 'User not found',
      });
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        error: 'Invalid Login Credentials',
      });
    }

    const secret = process.env.JWT_SECRET as string;
    const token = jwt.sign({ _id: user._id }, secret);
    const expires = Number(new Date()) + 604800000;

    res.cookie('mc', token, {
      expires: new Date(expires),
    });

    res.status(200).json({ user, token });
  } catch (err) {
    res.status(401).json({
      error: err.message,
    });
  }
};

const signout = async (req: Request, res: Response) => {
  res.clearCookie('tc');
  return res.status(200).json({
    message: 'signed out successfully',
  });
};

const handleGoogleAuth = async (
  accessToken: string,
  refreshToken: string,
  profile: any,
  done: any
) => {
  const user = await User.findOne({ email: profile._json.email });

  if (user) {
    done(null, user);
  } else {
    const newUser = new User({
      firstName: profile._json.given_name,
      lastName: profile._json.family_name,
      email: profile._json.email,
      password: profile.id,
      refreshToken,
    });

    await newUser.save();
    done(null, newUser);
  }
};

export { signin, signout, handleGoogleAuth };
