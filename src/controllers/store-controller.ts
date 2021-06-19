import { Request, Response } from 'express';
import Joi from 'joi';
import Store from '../models/store-model';

const storeSchema = Joi.object({
  name: Joi.string().min(3).required(),
  bio: Joi.string(),
  category: Joi.string().required(),
});

const createStore = async (req: Request, res: Response) => {
  const storeData = storeSchema.validate(req.body);

  if (storeData.error) {
    const err = storeData.error.details[0].message;

    return res.status(400).json({
      error: err.split('\"').join(''),
    });
  }

  const store = new Store({ ...storeData.value, merchant: req.user._id });

  try {
    await store.save();

    res.status(201).json({
      message: 'store created successfully',
    });
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};

const getStoresByMerchantId = async (req: Request, res: Response) => {
  try {
    const stores = await Store.find({
      merchant: req.user._id,
    })
      .populate('merchant', '_id fullName')
      .sort('-createdAt')
      .limit(10)
      .skip(parseInt(req.query.skip as string));

    res.status(200).json(stores);
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};

const getStoreById = async (req: Request, res: Response) => {
  try {
    const store = await Store.findById(req.params.id).populate(
      'merchant',
      '_id fullName'
    );

    if (store.merchant !== req.user._id) {
      return res.status(403).json({
        error: 'Merchant is not authorized to view this store',
      });
    }

    if (!store) {
      return res.status(404).json({
        error: 'Store not found',
      });
    }

    res.status(200).json(store);
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};

const updateStore = async (req: Request, res: Response) => {
  const updates = Object.keys(req.body);

  try {
    const store = await Store.findById(req.params.id);

    if (store.merchant !== req.user._id) {
      return res.status(403).json({
        error: 'Merchant is not authorized to update this store',
      });
    }

    if (!store) {
      return res.status(404).json({
        error: 'Store not found',
      });
    }

    updates.forEach((field) => (store[field] = req.body[field]));
    await store.save();
    res.status(200).json(store);
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};

const removeStore = async (req: Request, res: Response) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({
        error: 'Store not found',
      });
    }

    if (store.merchant !== req.user._id) {
      return res.status(403).json({
        error: 'Merchant is not authorized to remove this store',
      });
    }

    await store.remove();
    res.status(200).json(store);
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};

const uploadStoreImage = async (req: Request, res: Response) => {
  try {
    const store = await Store.findById(req.params.storeId);

    if (!store) {
      return res.status(404).json({
        error: 'Store not found',
      });
    }

    if (store.merchant !== req.user._id) {
      return res.status(403).json({
        error: 'Merchant is not authorized to upload images for this store',
      });
    }

    const file: any = req.file;
    store.image = file.path;
    await store.save();
    res.status(200).json({
      message: 'store image uploaded',
    });
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};

const isStoreCustomer = async (customerId: string, storeId: string) => {
  try {
    const store = await Store.findById(storeId);
    if (store.customers[customerId]) {
      return true;
    }
    return false;
  } catch (err) {
    throw new Error(err.message);
  }
};


export {
  createStore,
  getStoreById,
  getStoresByMerchantId,
  updateStore,
  removeStore,
  isStoreCustomer,
  uploadStoreImage,
};
