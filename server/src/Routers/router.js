import express from 'express';
import reviewRouter from './ReviewRouter.js';
import postRouter from './PostRouter.js';
import productRouter from './ProductRouter.js';
import cartRouter from './CartRouter.js';
import categoryRouter from './CategoryRouter.js';
import subcategoryRouter from './SubcategoryRouter.js';
import authRouter from './AuthRouter.js';
import userRouter from './UserRouter.js';
import orderRouter from './OrderRouter.js'
import paypalRouter from './PayPalRouter.js';
import chatRouter from './ChatRouter.js';

const router = express.Router();

router.use('/reviews', reviewRouter);
router.use('/posts', postRouter);
router.use('/products', productRouter);
router.use('/cart', cartRouter);
router.use('/orders', orderRouter);
router.use('/categories', categoryRouter);
router.use('/subcategories', subcategoryRouter);
router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/paypal', paypalRouter);
router.use('/chat', chatRouter);

export default router;
