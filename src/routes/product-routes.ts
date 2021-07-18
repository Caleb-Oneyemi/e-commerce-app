import express from 'express';
import { isAuthenticated } from '../middleware/auth';
import {
  createProduct,
  getProductsByStoreId,
  getProductById,
  updateProduct,
  removeProduct,
  uploadProductImage
} from '../controllers/product-controller';

const router = express.Router();

router.post('/api/products/:storeId', isAuthenticated, createProduct);

router.post(
  '/api/products/:productId/image',
  isAuthenticated,
  uploadProductImage
);

router.get('/api/products/store/:storeId', getProductsByStoreId);

router.get('/api/products/:id', getProductById);

router.patch('/api/products/:id', isAuthenticated, updateProduct);

router.delete('/api/products/:id', isAuthenticated, removeProduct);

export default router;
