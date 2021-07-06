import { Request, Response } from 'express';
import Joi from 'joi';
import bcrypt from 'bcryptjs';
import User from '../models/user-model';
import { sendMail } from '../services/email-service';

const userSchema = Joi.object({
  firstName: Joi.string().min(3).max(30).required(),
  lastName: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string().length(14).required(),
  password: Joi.string().min(3).max(30).alphanum().required(),
});

const createMerchant = async (req: Request, res: Response) => {
  const userData = userSchema.validate(req.body);

  if (userData.error) {
    const err = userData.error.details[0].message;

    return res.status(400).json({
      error: err.split('"').join(''),
    });
  }

  const user = new User(userData.value);

  try {
    const subject = 'Welcome to Maestro';
    const text = `We're really glad to have you on board, please visit ${process.env.FRONTEND_URL}/confirm/${user._id} to confirm your mail`;

    await user.save();

    await sendMail(user.email, subject, text);
    res.status(201).json({
      message: 'signup successful',
    });
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};

const getMerchant = async (req: Request, res: Response) => {
  return res.status(200).send(req.user);
};

const getMerchantById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        error: 'Merchant not found',
      });
    }

    res.status(200).json({ email: user.email });
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};

const updateMerchant = async (req: Request, res: Response) => {
  const updates = Object.keys(req.body);
  if (updates.length === 0) {
    return res.status(400).send({
      error: 'At least one field must be updated',
    });
  }

  try {
    updates.forEach((field) => {
      if (field !== 'password') {
        return (req.user[field] = req.body[field]);
      }
    });
    await req.user.save();

    res.status(200).send({
      message: 'Account updated successfully',
    });
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};

const deleteMerchant = async (req: Request, res: Response) => {
  try {
    await req.user.remove();
    res.send(req.user);
  } catch (err) {
    res.status(500).send({
      error: err.message,
    });
  }
};

const changePassword = async (req: Request, res: Response) => {
  const { oldPassword, newPassword, confirmedPassword } = req.body;

  if (!oldPassword || !newPassword || !confirmedPassword) {
    return res.status(401).json({
      error: 'fields cannot be epmty',
    });
  }

  try {
    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        error: 'wrong old password',
      });
    }

    if (newPassword !== confirmedPassword) {
      return res.status(401).json({
        error: 'your new password and confirmed password must be the same',
      });
    }

    req.user.password = newPassword;
    await req.user.save();
    res.status(200).json({
      message: 'password changed successfully',
    });
  } catch (err) {
    res.status(400).send({
      error: err.message,
    });
  }
};

const uploadImage = async (req: Request, res: Response) => {
  try {
    req.user.image = req.body.url;
    await req.user.save();
    res.status(200).json({
      message: 'user profile image uploaded',
    });
  } catch (err) {
    res.status(400).send({
      error: err.message,
    });
  }
};

const confirmMerchant = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.userId);
    user.confirmed = true;
    await user.save();

    res.status(200).json({
      message: 'user account confirmed successfully',
    });
  } catch (err) {
    res.status(400).send({
      error: err.message,
    });
  }
};

export {
  createMerchant,
  getMerchant,
  getMerchantById,
  updateMerchant,
  deleteMerchant,
  changePassword,
  uploadImage,
  confirmMerchant,
};
