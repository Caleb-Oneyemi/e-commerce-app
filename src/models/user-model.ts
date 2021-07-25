import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import Store from './store-model';

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
      lowercase: true,
      required: 'Firstname is required.',
    },
    lastName: {
      type: String,
      trim: true,
      lowercase: true,
      required: 'Lastname is required.',
    },
    fullName: {
      type: String,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: 'Email is required.',
      unique: 'Email already in use.',
      validate(email: string) {
        if (!validator.isEmail(email)) {
          throw new Error('invalid email');
        }
      },
    },
    phoneNumber: {
      type: String,
      validate(num: string) {
        if (!validator.isMobilePhone(num)) {
          throw new Error('Phone number must be valid');
        }
      },
    },
    password: {
      type: String,
      minLength: 7,
      trim: true,
      required: 'Password is required.',
      validate(password: string) {
        if (password.includes('password')) {
          throw new Error('password must not contain password');
        }
      },
    },
    image: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
    confirmed: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  const user: any = this;
  const salt: number = parseInt(process.env.SALT_ROUNDS as string);

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, salt);
  }

  if (user.isModified('firstName') || user.isModified('lastName')) {
    user.fullName = `${user.firstName} ${user.lastName}`;
  }

  next();
});

userSchema.pre('remove', async function (next) {
  const user: any = this;
  await Store.deleteMany({ merchant: user._id });
  next();
});

export default mongoose.model('User', userSchema);
