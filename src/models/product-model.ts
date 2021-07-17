import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      trim: true,
      required: 'Product Name is required',
    },
    description: {
      type: String,
      trim: true,
    },
    quantity: {
      type: Number,
      min: 0,
      required: 'Quantity is required',
    },
    price: {
      type: Number,
      min: 0,
      required: 'Price is required',
    },
    limit: {
      type: Number,
      min: 0,
      default: 0
    },
    image: {
      type: String,
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    merchant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Product', productSchema);
