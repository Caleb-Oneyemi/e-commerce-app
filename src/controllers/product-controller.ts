import { Request, Response } from 'express';
import Joi from 'joi';
import Product from '../models/product-model';
import Store from '../models/store-model';

type TOrderType = [{ product: string; quantity: string }];

const productSchema = Joi.object({
  name: Joi.string().min(3).required(),
  description: Joi.string(),
  quantity: Joi.number().required(),
  price: Joi.number().required(),
});

const createProduct = async (req: Request, res: Response) => {
  const productData = productSchema.validate(req.body);

  if (productData.error) {
    const err = productData.error.details[0].message;

    return res.status(400).json({
      error: err.split('\"').join(''),
    });
  }

  const product = new Product({
    ...productData.value,
    store: req.params.storeId,
    merchant: req.user._id,
  });

  try {
    await product.save();

    res.status(201).json({
      message: 'product created successfully',
    });
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};

const getProductsByStoreId = async (req: Request, res: Response) => {
  try {
    const store = Store.findById(req.params.storeId);

    if (store.merchant !== req.user._id) {
      return res.status(403).json({
        error: 'Merchant is not authorized to view these products',
      });
    }

    const products = await Product.find({ store: req.params.storeId })
      .sort('-createdAt')
      .limit(10)
      .skip(parseInt(req.query.skip as string));

    res.status(200).json(products);
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};

const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
      });
    }

    if (product.merchant !== req.user._id) {
      return res.status(403).json({
        error: 'Merchant is not authorized to view this product',
      });
    }

    res.status(200).json(product);
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};

const updateProduct = async (req: Request, res: Response) => {
  const updates = Object.keys(req.body);
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
      });
    }

    if (product.merchant !== req.user._id) {
      return res.status(403).json({
        error: 'Merchant is not authorized to update this product',
      });
    }

    updates.forEach((field) => (product[field] = req.body[field]));
    await product.save();
    res.status(200).json(product);
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};

const removeProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
      });
    }

    if (product.merchant !== req.user._id) {
      return res.status(403).json({
        error: 'Merchant is not authorized to remove this product',
      });
    }

    await product.remove();
    res.status(200).json(product);
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};

const uploadProductImages = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.productId);
    console.log('p', product)

    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
      });
    }

    if (product.merchant !== req.user._id) {
      return res.status(403).json({
        error: 'Merchant is not authorized to upload images for this product',
      });
    }

    const file: any = req.file;
    if (product.images.length === 5) {
      return res.status(400).json({
        error: 'Only 5 images per Product'
      });
    }

    product.images.push(file.path);
    await product.save();
    res.status(200).json({
      message: 'product image uploaded',
    });
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};

const increaseProductQuantities = async (orderItems: TOrderType) => {
  let storeProduct;
  for (let { product, quantity } of orderItems) {
    storeProduct = await Product.findById(product);
    storeProduct.quantity += parseInt(quantity);
    await storeProduct.save();
  }
};

const decreaseProductQuantities = async (orderItems: TOrderType) => {
  let storeProduct;
  for (let { product, quantity } of orderItems) {
    storeProduct = await Product.findById(product);
    if (storeProduct.quantity - parseInt(quantity) < 0) {
      throw new Error(`Only ${storeProduct.quantity} items left`);
    }
    storeProduct.quantity -= parseInt(quantity);
    await storeProduct.save();
  }
};

export {
  createProduct,
  getProductsByStoreId,
  getProductById,
  updateProduct,
  removeProduct,
  uploadProductImages,
  increaseProductQuantities,
  decreaseProductQuantities,
};