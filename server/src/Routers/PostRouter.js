import Router from 'express';
import PostController from '../Controllers/PostController.js';
import AuthMiddlewareHelper from '../Services/AuthMiddlewareHelper.js';

const postRouter = new Router();

postRouter.post('/post', [AuthMiddlewareHelper.roleCheck("USER"), AuthMiddlewareHelper.authCheck], PostController.createPost);
postRouter.get('/posts', PostController.getPosts);
postRouter.get('/posts/:userID', PostController.getPostsByAuthorID);
postRouter.get('/post/:id', PostController.getPost);
postRouter.put('/post/:id', PostController.updatePost);
postRouter.delete('/post/:id' , AuthMiddlewareHelper.roleCheck("ADMIN"), PostController.deletePost);

export default postRouter;