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

const orderSchema = new mongoose.Schema(
  {
    orderItems: { type: [orderItemSchema], required: true },
    status: {
      type: String,
      default: 'not processed',
      enum: [
        'not processed',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
      ],
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
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
    tid: {
      type: String,
      required: true,
    },
    orderTotal: {
      type: Number,
      required: true
    },
    merchantEmail: {
      type: String,
      validate(email: string) {
        if (!validator.isEmail(email)) {
          throw new Error('invalid email');
        }
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Order', orderSchema);
