import BaseService from './BaseService.js';
import Product from '../Models/Product.js'; // Замінили Book на Product

class ProductService extends BaseService {
    constructor() {
        super(Product);
    }

    async getOne(id) {
      const product = await Product.findById(id)
        .populate('categoryId')
        .populate('subcategories')
        .populate({
          path: 'reviews',
          populate: {
            path: 'userId',
            select: 'name email' // або тільки name, якщо email не потрібен
          }
        });
    
      if (!product) throw new Error('Товар не знайдено'); // Оновили текст помилки
      
      // Якщо на сторінці одного товару тобі теж потрібен середній рейтинг, 
      // ти можеш додати його підрахунок тут, так само як у getAll.
      // Але поки залишаю як було у твоєму коді:
      return product;
    }

    async getAll() {
      const products = await Product.find()
        .populate('categoryId')
        .populate('subcategories')
        .populate({
          path: 'reviews',
          populate: {
            path: 'userId',
            select: 'name'
          }
        });
    
      // Додаємо середній рейтинг
      const productsWithRating = products.map(product => {
        let averageRating = 0;
    
        if (product.reviews.length > 0) {
          const total = product.reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
          averageRating = total / product.reviews.length;
        }
    
        return {
          ...product.toObject(), // перетворюємо Mongoose-документ на простий об'єкт
          averageRating: Number(averageRating.toFixed(1))
        };
      });
    
      return productsWithRating;
    }
}

export default new ProductService();