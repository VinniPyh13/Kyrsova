import BaseService from './BaseService.js';
import Book from '../Models/Book.js';

class BookService extends BaseService {
    constructor() {
        super(Book);
    }
    async getOne(id) {
      const book = await Book.findById(id)
        .populate('categoryId')
        .populate('subcategories')
        .populate({
          path: 'reviews',
          populate: {
            path: 'userId',
            select: 'name email' // або тільки name, якщо email не потрібен
          }
        });
    
      if (!book) throw new Error('Книга не знайдена');
      return book;
    }

    async getAll() {
      const books = await Book.find()
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
      const booksWithRating = books.map(book => {
        let averageRating = 0;
    
        if (book.reviews.length > 0) {
          const total = book.reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
          averageRating = total / book.reviews.length;
        }
    
        return {
          ...book.toObject(), // перетворюємо Mongoose-документ на простий об'єкт
          averageRating: Number(averageRating.toFixed(1))
        };
      });
    
      return booksWithRating;
    }
    
    
}

export default new BookService();
