import express from 'express';
import {
  createSubcategory,
  getAllSubcategories,
  getSubcategoriesByCategory,
  updateSubcategory,
  deleteSubcategory
} from '../Controllers/SubcategoryController.js';

const router = express.Router();

router.post('/', createSubcategory);
router.get('/', getAllSubcategories);
router.get('/category/:categoryId', getSubcategoriesByCategory);
router.put('/:id', updateSubcategory);
router.delete('/:id', deleteSubcategory);


export default router;