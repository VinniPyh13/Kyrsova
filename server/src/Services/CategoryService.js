import BaseService from './BaseService.js';
import Category from '../Models/Category.js';

class CategoryService extends BaseService {
    constructor() {
        super(Category);
    }

    async getAll() {
        return await Category.find().populate('subcategories');
    }

    async getOne(id) {
        return await Category.findById(id).populate('subcategories');
    }
}

export default new CategoryService();
