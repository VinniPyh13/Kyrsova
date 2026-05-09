import express from 'express';
import CategoryController from '../Controllers/categoryController.js';

const categoryRouter = express.Router();

categoryRouter.get('/', CategoryController.getCategories);
categoryRouter.get('/:id', CategoryController.getCategory);
categoryRouter.post('/', CategoryController.createCategory);
categoryRouter.put('/:id', CategoryController.updateCategory);
categoryRouter.delete('/:id', CategoryController.deleteCategory);

export default categoryRouter;
