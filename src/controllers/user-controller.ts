import { Request, Response } from 'express';
import Joi from 'joi';
import bcrypt from 'bcryptjs';
import User from '../models/user-model';

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
    await user.save();
    res.status(201).json({
      message: 'user signup successful',
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

const updateMerchant = async (req: Request, res: Response) => {
  const updates = Object.keys(req.body);

  try {
    updates.forEach((field) => {
      if (field !== 'password') {
        return (req.user[field] = req.body[field]);
      }
    });
    await req.user.save();

    res.status(200).send(req.user);
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

  try {
    const isMatch = await bcrypt.compare(oldPassword, req.user.password);

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
    const file: any = req.file;
    req.user.image = file.path;
    await req.user.save();
    res.status(200).json({
      message: 'user profile image uploaded'
    })
  } catch (err) {
    res.status(400).send({
      error: err.message,
    });
  }
};

const confirmMerchant = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.userId);
    user.confirmed = true
    await user.save();

    res.status(200).json({
      message: 'user account confirmed successfully'
    })
  } catch (err) {
    res.status(400).send({
      error: err.message,
    });
  }
}

export {
  createMerchant,
  getMerchant,
  updateMerchant,
  deleteMerchant,
  changePassword,
  uploadImage,
  confirmMerchant
};
