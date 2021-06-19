import express from 'express';
import passport from 'passport';
import { signin, signout } from '../controllers/auth-controller';
import { isAuthenticated } from '../middleware/auth';

const router = express.Router();

router.post('/auth/signin', signin);

router.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

router.get('/auth/google/redirect', passport.authenticate('google'), (req, res) => {
    res.send(req.user);
})

router.get('/auth/signout', isAuthenticated, signout);

export default router;
