import CategoryService from '../Services/CategoryService.js';
import Category from '../Models/Category.js';


class CategoryController {
    async getCategories(req, res) {
        try {
            const categories = await CategoryService.getAll();
            return res.json(categories);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async getCategory(req, res) {
        try {
            const category = await CategoryService.getOne(req.params.id);
            return res.json(category);
        } catch (err) {
            res.status(404).json({ message: err.message });
        }
    }

    async createCategory(req, res) {
        try {
            const newCategory = await CategoryService.create(req.body);
            return res.status(201).json(newCategory);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

// updateCategory
    async updateCategory(req, res) {
        try {
            const updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!updated) return res.status(404).json({ message: 'Категорію не знайдено' });
            res.json(updated);
        } catch (err) {
            res.status(500).json({ message: 'Помилка оновлення категорії', error: err.message });
        }
    }


    async deleteCategory(req, res) {
        try {
            await CategoryService.delete(req.params.id);
            return res.json({ message: 'Category deleted successfully' });
        } catch (err) {
            res.status(404).json({ message: err.message });
        }
    }
}

export default new CategoryController();
