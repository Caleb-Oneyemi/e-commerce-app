import google from 'passport-google-oauth20';
import { handleGoogleAuth } from '../controllers/auth-controller';
import dotenv from 'dotenv'

dotenv.config();

const GoogleStrategy = google.Strategy;

const config = new GoogleStrategy(
  {
    clientID: process.env.CLIENT_ID as string,
    clientSecret: process.env.CLIENT_SECRET as string,
    callbackURL: '/auth/google/redirect',
  },
  handleGoogleAuth
);

export default config;