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
      required: 'Quantity is required',
    },
    price: {
      type: Number,
      required: 'Price is required',
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
