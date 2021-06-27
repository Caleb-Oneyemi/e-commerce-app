import express from 'express';
import { isAuthenticated } from '../middleware/auth';
import {
  createOrder,
  getOrdersByStoreId,
  getOrderById,
  getOrderByTrackingId,
  getLatestOrderByCustomerEmail,
  getOrdersByStatus,
  updateOrderStatus,
  cancelOrder,
} from '../controllers/order-controller';

const router = express.Router();

router.post('/api/orders/:storeId', createOrder);

router.get('/api/orders/store/:storeId', isAuthenticated, getOrdersByStoreId);

router.get('/api/orders/:id', isAuthenticated, getOrderById);

router.post('/api/orders/tid/:tid', getOrderByTrackingId);

router.post(
  '/api/orders/customer/:storeId',
  isAuthenticated,
  getLatestOrderByCustomerEmail
);

router.post('/api/orders/status/:storeId', isAuthenticated, getOrdersByStatus);

router.patch('/api/orders/:id', isAuthenticated, updateOrderStatus);

router.delete('/api/orders/:tid', cancelOrder);



export default router;
