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
    return res.status(400).json({
      error: storeData.error.details[0].message,
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
      error: 'Error on creating new store',
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
      error: 'Error on getting stores',
    });
  }
};

const getStoreById = async (req: Request, res: Response) => {
  try {
    const store = await Store.findById(req.params.id).populate(
      'merchant',
      '_id fullName'
    );

    if (!store) {
      return res.status(404).json({
        error: 'Store not found',
      });
    }

    res.status(200).json(store);
  } catch (err) {
    res.status(400).json({
      error: 'Error on getting store',
    });
  }
};

const updateStore = async (req: Request, res: Response) => {
  if(!req.stores.includes(req.params.id)) {
    return res.status(400).json({
      error: 'You are not authorized to perform this operation',
    });
  }

  const updates = Object.keys(req.body);

  if (updates.length === 0) {
    return res.status(400).send({
      error: 'At least one field must be updated',
    });
  }

  try {
    const store = await Store.findById(req.params.id);

    if (!store) {
      return res.status(404).json({
        error: 'Store not found',
      });
    }

    updates.forEach((field) => (store[field] = req.body[field]));
    await store.save();
    res.status(200).json({
      message: 'Store updated successfully'
    });
  } catch (err) {
    res.status(400).json({
      error: 'Error on updating store',
    });
  }
};

const removeStore = async (req: Request, res: Response) => {
  try {
    if(!req.stores.includes(req.params.id)) {
      return res.status(400).json({
        error: 'You are not authorized to perform this operation',
      });
    }

    const store = await Store.findById(req.params.id);

    if (!store) {
      return res.status(404).json({
        error: 'Store not found',
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

    store.image = req.body.url;
    await store.save();
    res.status(200).json({
      message: 'Store image uploaded',
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
    if (store.customers.includes(customerId)) {
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
