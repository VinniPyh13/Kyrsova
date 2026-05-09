import express from 'express';
import ProductController from '../Controllers/ProductController.js';

const productRouter = express.Router();

productRouter.get('/', ProductController.getProducts);
productRouter.get('/:id', ProductController.getProduct);
productRouter.get('/sales', ProductController.getSaleProducts);
productRouter.post('/', ProductController.createProduct);
productRouter.put('/:id', ProductController.updateProduct);
productRouter.delete('/:id', ProductController.deleteProduct);

export default productRouter;
