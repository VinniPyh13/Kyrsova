import express from 'express';
import OrderController from '../Controllers/OrderController.js';
import AuthMiddlewareHelper from '../Services/AuthMiddlewareHelper.js';

const orderRouter = express.Router();

orderRouter.post('/', [AuthMiddlewareHelper.authCheck], OrderController.createOrder);
orderRouter.get('/', OrderController.getAllOrders);
orderRouter.get('/user', [AuthMiddlewareHelper.authCheck], OrderController.getOrdersByUser);
orderRouter.get('/:id', OrderController.getOrderById);
orderRouter.put('/:id', OrderController.updateOrder);
orderRouter.delete('/:id', OrderController.deleteOrder);

export default orderRouter;
