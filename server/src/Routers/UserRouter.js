import express from 'express';
import UserController from '../Controllers/UserController.js';
import AuthMiddlewareHelper from '../Services/AuthMiddlewareHelper.js';

const userRouter = express.Router();

userRouter.get('/', [AuthMiddlewareHelper.roleCheck("USER"), AuthMiddlewareHelper.authCheck], UserController.getUsers);
userRouter.get('/me', [AuthMiddlewareHelper.authCheck], UserController.getCurrentUser);
userRouter.get('/:id', UserController.getUser);
userRouter.post('/', UserController.createUser);
userRouter.put('/:id', UserController.updateUser);
userRouter.delete('/:id', UserController.deleteUser);
userRouter.post('/favorites/remove', AuthMiddlewareHelper.authCheck, UserController.addToFavorites);
userRouter.delete('/favorites/remove', AuthMiddlewareHelper.authCheck, UserController.removeFromFavorites);
userRouter.get('/:userId/favorites', [AuthMiddlewareHelper.authCheck], UserController.getFavoriteBooks);




export default userRouter;
