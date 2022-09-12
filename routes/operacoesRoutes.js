import express from 'express';
import { deleteOperation, getOperations,postOperation, updateOperation } from '../controllers/operacoesControllers.js';
import operationValidate from '../middleware/operationSchemaValidationMiddleWares.js';
import {tokenVerification } from '../middleware/tokenAuthorizationMiddlewares.js';

const operationRouter = express.Router();

operationRouter.get('/operacao',tokenVerification,getOperations);
operationRouter.post('/operacao',operationValidate,tokenVerification,postOperation);
operationRouter.put('/operacao',operationValidate,tokenVerification,updateOperation);
operationRouter.post('/deloperacao',tokenVerification,deleteOperation)

export default operationRouter;