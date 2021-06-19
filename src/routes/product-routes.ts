import express from 'express';
import { isAuthenticated } from '../middleware/auth';
import {
  createProduct,
  getProductsByStoreId,
  getProductById,
  updateProduct,
  removeProduct,
  uploadProductImages
} from '../controllers/product-controller';
import { parser } from '../middleware/upload-img';

const router = express.Router();

router.post('/api/products/:storeId', isAuthenticated, createProduct);

router.post(
  '/api/products/:productId/images',
  isAuthenticated,
  parser.single('image'),
  uploadProductImages
);

router.get('/api/products/store/:storeId', isAuthenticated, getProductsByStoreId);

router.get('/api/products/:id', isAuthenticated, getProductById);

router.patch('/api/products/:id', isAuthenticated, updateProduct);

router.delete('/api/products/:id', isAuthenticated, removeProduct);

export default router;
