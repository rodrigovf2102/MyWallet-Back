import express from 'express';
import { postNewUser,postUserSignIn,getUser } from '../controllers/usersController.js';
import { validateSignUp, validateSignIn } from '../middleware/userSchemaValidationMiddleWares.js';
import {tokenVerification} from '../middleware/tokenAuthorizationMiddlewares.js'

const userRouter = express.Router();

userRouter.post('/sign-up',validateSignUp,postNewUser);
userRouter.post('/sign-in',validateSignIn,postUserSignIn);
userRouter.get('/user',tokenVerification,getUser);

export default userRouter;