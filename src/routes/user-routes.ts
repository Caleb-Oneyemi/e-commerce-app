import express from 'express';
import { isAuthenticated } from '../middleware/auth';
import {
  createMerchant,
  getMerchant,
  updateMerchant,
  deleteMerchant,
  changePassword,
  uploadImage,
  confirmMerchant
} from '../controllers/user-controller';
import { parser } from '../middleware/upload-img';

const router = express.Router();

router.post('/api/users', createMerchant);

router.post('/api/users/changepass', isAuthenticated, changePassword);

router.post(
  '/api/users/me/image',
  isAuthenticated,
  parser.single('image'),
  uploadImage
);

router.get('/api/users/me', isAuthenticated, getMerchant);

router.get('/api/users/confirm/:userId', confirmMerchant);


router.patch('/api/users', isAuthenticated, updateMerchant);

router.delete('/api/users', isAuthenticated, deleteMerchant);

export default router;
