import mongoose from 'mongoose';
import Product from './product-model';

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      lowercase: true,
      required: 'Store Name is required.',
      unique: 'Store Name already taken.',
    },
    bio: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Fashion and Accessories',
        'Food and Drinks',
        'Electronics',
        'Books',
        'Art',
      ],
    },
    image: {
      type: String,
    },
    customers: {
      type: mongoose.Schema.Types.Mixed,
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

storeSchema.pre('remove', async function (next) {
  const store: any = this;
  await Product.deleteMany({ store: store._id });
  next();
});

export default mongoose.model('Store', storeSchema);
