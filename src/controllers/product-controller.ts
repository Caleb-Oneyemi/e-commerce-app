import { Request, Response } from 'express';
import Joi from 'joi';
import Product from '../models/product-model';
import { sendMail } from '../services/email-service';

type TOrderType = [{ product: string; quantity: string }];

const productSchema = Joi.object({
  name: Joi.string().min(3).required(),
  description: Joi.string(),
  quantity: Joi.number().required(),
  price: Joi.number().required(),
  limit: Joi.number()
});

const createProduct = async (req: Request, res: Response) => {
  const productData = productSchema.validate(req.body);

  if (productData.error) {
    return res.status(400).json({
      error: productData.error.details[0].message,
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
      error: 'Error on creating new product',
    });
  }
};

const getProductsByStoreId = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({ store: req.params.storeId })
      .sort('-createdAt')
      .limit(10)
      .skip(parseInt(req.query.skip as string));

    res.status(200).json(products);
  } catch (err) {
    res.status(400).json({
      error:'Error on getting store products',
    });
  }
};

const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'merchant',
      '_id, email'
    );

    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
      });
    }

    res.status(200).json(product);
  } catch (err) {
    res.status(400).json({
      error: 'Error on getting product',
    });
  }
};

const updateProduct = async (req: Request, res: Response) => {
  const updates = Object.keys(req.body);

  if (updates.length === 0) {
    return res.status(400).send({
      error: 'At least one field must be updated',
    });
  }

  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
      });
    }

    if(String(req.user._id) !== String(product.merchant)) {
      return res.status(404).json({
        error: 'You are not permitted to edit this Product',
      });
    }

    updates.forEach((field) => (product[field] = req.body[field]));
    await product.save();
    res.status(200).json({
      message: 'Product updated successfully',
    });
  } catch (err) {
    res.status(400).json({
      error: 'Error on updating product',
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

    await product.remove();
    res.status(200).json(product);
  } catch (err) {
    res.status(400).json({
      error: 'Error on removing product',
    });
  }
};

const uploadProductImage = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
      });
    }

    product.image = req.body.url;
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

const decreaseProductQuantities = async (orderItems: TOrderType, merchantMail: string) => {
  let storeProduct;
  let subject = 'Inventory Alert';
  let text = 'Your product(s) ';
  let isLimitExceeded = false;
  
  for (let { product, quantity } of orderItems) {
    storeProduct = await Product.findById(product);
    if (storeProduct.quantity - parseInt(quantity) < 0) {
      throw new Error(`Only ${storeProduct.quantity} items left`);
    }
    
    if (storeProduct.quantity - parseInt(quantity) < storeProduct.limit) {
      isLimitExceeded = true;
      text += `${storeProduct.name}, `
    }

    storeProduct.quantity -= parseInt(quantity);
    await storeProduct.save();

    if(isLimitExceeded) {
      text += 'have gone below the order limits you set on Maestro'
      await sendMail(merchantMail, subject, text);
    }
  }
};

export {
  createProduct,
  getProductsByStoreId,
  getProductById,
  updateProduct,
  removeProduct,
  uploadProductImage,
  increaseProductQuantities,
  decreaseProductQuantities,
};
