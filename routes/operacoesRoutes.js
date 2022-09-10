import express from 'express';
import { getOperations,postOperation } from '../controllers/operacoesControllers.js';
import operationValidate from '../middleware/operationSchemaValidationMiddleWares.js';
import { tokenVerificationGetOperations } from '../middleware/tokenAuthorizationMiddlewares.js';

const operationRouter = express.Router();

operationRouter.get('/operacao',tokenVerificationGetOperations,getOperations);
operationRouter.post('/operacao',operationValidate,postOperation);

export default operationRouter;