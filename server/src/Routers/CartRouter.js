import express from 'express';
import CartController from '../Controllers/CartController.js';
import CartService from '../Services/CartService.js';

import AuthMiddlewareHelper from '../Services/AuthMiddlewareHelper.js';


const cartRouter = express.Router();

//cartRouter.get('/', CartController.getCarts);
//cartRouter.get('/:userID', CartController.getCartByUser);
cartRouter.get('/', [AuthMiddlewareHelper.authCheck], CartController.getCartByUser);

cartRouter.post('/add', [AuthMiddlewareHelper.authCheck], CartController.addItemToCart);
cartRouter.post('/remove', [AuthMiddlewareHelper.authCheck], CartController.removeItemFromCart);
cartRouter.post('/', CartController.createCart);
cartRouter.put('/:userID', CartController.updateCart);
cartRouter.delete('/:userID', CartController.deleteCart);

export default cartRouter;
