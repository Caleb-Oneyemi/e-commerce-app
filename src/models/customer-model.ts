import mongoose from 'mongoose';
import validator from 'validator';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
});

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      lowercase: true,
      required: 'Name is required.',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: 'Email is required.',
      validate(email: string) {
        if (!validator.isEmail(email)) {
          throw new Error('invalid email');
        }
      },
    },
    phoneNumber: {
      type: String,
      required: 'Phone Number is required.',
      validate(num: string) {
        if (!validator.isMobilePhone(num, ['en-NG'], { strictMode: true })) {
          throw new Error('Phone number must be valid and start with +234');
        }
      },
    },
    address: {
      type: String,
      trim: true,
      required: 'Address is required.',
    },
    orders: [
      {
        store: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Store',
          required: true,
        },
        items: [orderItemSchema],
        date: Date,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Customer', customerSchema);
