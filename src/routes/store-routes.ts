import express from 'express';
import { isAuthenticated } from '../middleware/auth';
import {
  createStore,
  getStoreById,
  getStoresByMerchantId,
  updateStore,
  removeStore,
  uploadStoreImage
} from '../controllers/store-controller';
import { parser } from '../middleware/upload-img';

const router = express.Router();

router.post('/api/stores', isAuthenticated, createStore);

router.post(
  '/api/stores/:storeId/image',
  isAuthenticated,
  parser.single('image'),
  uploadStoreImage
);

router.get('/api/stores', isAuthenticated, getStoresByMerchantId);

router.get('/api/stores/:id', isAuthenticated, getStoreById);

router.patch('/api/stores/:id', isAuthenticated, updateStore);

router.delete('/api/stores/:id', isAuthenticated, removeStore);

export default router;
