import express from 'express';
import ReviewController from '../Controllers/reviewController.js';
import AuthMiddlewareHelper from '../Services/AuthMiddlewareHelper.js';

const reviewRouter = express.Router();

reviewRouter.get('/', ReviewController.getReviews);
reviewRouter.get('/:reviewID', ReviewController.getReview);
reviewRouter.post('/', [AuthMiddlewareHelper.authCheck], ReviewController.createReview);
reviewRouter.put('/:reviewID', [AuthMiddlewareHelper.authCheck], ReviewController.updateReview);
reviewRouter.delete('/:reviewID', ReviewController.deleteReview);
reviewRouter.delete('/admin/:reviewID',[AuthMiddlewareHelper.authCheck, AuthMiddlewareHelper.roleCheck('ADMIN')],ReviewController.deleteReviewByAdmin);


export default reviewRouter;
