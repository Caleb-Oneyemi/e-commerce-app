import { Request, Response } from 'express';
import Joi from 'joi';
import { nanoid } from 'nanoid';
import Order from '../models/order-model';
import Customer from '../models/customer-model';
import { handleOrder } from './customer-controller';
import { increaseProductQuantities } from './product-controller';

const orderSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string().length(14).required(),
  address: Joi.string().required(),
  orderItems: Joi.array().required(),
  merchantEmail: Joi.string()
});

const createOrder = async (req: Request, res: Response) => {
  const orderData = orderSchema.validate(req.body);

  if (orderData.error) {
    const err = orderData.error.details[0].message;

    return res.status(400).json({
      error: err.split('\"').join(''),
    });
  }

  try {
    const order = new Order({
      ...req.body,
      store: req.params.storeId,
      tid: nanoid(8),
    })

    const customer = await Customer.findOne({ email: orderData.value.email });

    await handleOrder(customer, order, req.params.storeId);
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};

const getOrdersByStoreId = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({ store: req.params.storeId })
      .populate('orderItems.product', '_id name price')
      .sort('createdAt')
      .limit(10)
      .skip(parseInt(req.query.skip as string));;

    res.status(200).json(orders);
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};

const getOrderById = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'orderItems.product',
      '_id name price'
    );

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
      });
    }

    res.status(200).json(order);
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};

const getOrderByTrackingId = async (req: Request, res: Response) => {
  try {
    const order = await Order.findOne({ tid: req.body.tid }).populate(
      'orderItems.product',
      '_id name'
    ).populate('store', '_id name');

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
      });
    }

    res.status(200).json(order);
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};

const getLatestOrderByCustomerEmail = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({
      email: req.body.email,
      store: req.params.storeId,
    }).sort({ createdAt: 'desc' });

    orders[0].populate('orderItems.product', '_id name');

    res.status(200).json(orders[0]);
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};

const getOrdersByStatus = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({
      status: req.body.status,
      store: req.params.storeId,
    })
      .sort('createdAt')
      .limit(10)
      .skip(parseInt(req.query.skip as string));;

    res.status(200).json(orders);
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};

const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404).json({
        error: 'Order not found',
      });
    }

    order.status = req.body.status;
    await order.save();
    res.status(200).json({
      message: 'Order Status updated successfully'
    });
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};

const cancelOrder = async (req: Request, res: Response) => {
  try {
    const order = await Order.findOne({ tid: req.params.tid });
    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
      });
    }

    await order.remove();
    await increaseProductQuantities(order.orderItems);
    return res.status(200).json({
      message: 'order deleted successgully',
    });
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};

export {
  createOrder,
  getOrdersByStoreId,
  getOrderById,
  getOrderByTrackingId,
  getLatestOrderByCustomerEmail,
  getOrdersByStatus,
  updateOrderStatus,
  cancelOrder,
};
