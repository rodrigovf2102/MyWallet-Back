import express from 'express';
import userRouter from './usersRoutes.js';
import operationRouter from './operacoesRoutes.js';

const router = express.Router();

router.use(userRouter);
router.use(operationRouter);

export default router;