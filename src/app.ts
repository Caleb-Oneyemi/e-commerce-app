import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import logger from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import passport from 'passport';
import connectDB from './config/db-config';
import config from './config/passport-confg';
import User from './models/user-model';
import authRouter from './routes/auth-routes';
import userRouter from './routes/user-routes';
import storeRouter from './routes/store-routes';
import orderRouter from './routes/order-routes';
import productRouter from './routes/product-routes';

dotenv.config();
connectDB();

declare module 'express' {
  export interface Request {
    user?: any;
    store?: any;
  }
}

const app = express();

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cookieParser());
app.use(helmet());
app.use(logger('dev'));

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

passport.use(config);
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  User.findById(id).then((user: any) => {
    done(null, user);
  });
});

app.use(passport.initialize());

app.use('/', authRouter);
app.use('/', userRouter);
app.use('/', storeRouter);
app.use('/', orderRouter);
app.use('/', productRouter);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(err.status || 500).send(err.message || 'Something went wrong');
});

export default app;
