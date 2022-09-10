import express from 'express';
import { postNewUser,postUserSignIn,getUser } from '../controllers/usersController.js';
import { validateSignUp, validateSignIn } from '../middleware/userSchemaValidationMiddleWares.js';
import {tokenVerificationGetUser} from '../middleware/tokenAuthorizationMiddlewares.js'

const userRouter = express.Router();

userRouter.post('/sign-up',validateSignUp,postNewUser);
userRouter.post('/sign-in',validateSignIn,postUserSignIn);
userRouter.get('/user',tokenVerificationGetUser,getUser);

export default userRouter;