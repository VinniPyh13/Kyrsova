import BaseService from './BaseService.js';
import Review from '../Models/Review.js';
import User from '../Models/User.js';
import Book from '../Models/Book.js';

class ReviewService extends BaseService {
    constructor() {
        super(Review);
    }

    async create(data) {
        // Перевірка, чи існує користувач
        const userExists = await User.findById(data.userId);
        if (!userExists) {
            throw new Error('User does not exist');
        }

        // Перевірка, чи існує книга
        const bookExists = await Book.findById(data.bookId);
        if (!bookExists) {
            throw new Error('Book does not exist');
        }

        // Створення відгуку
        const createdReview = await this.model.create(data);

        // Додавання до User
        await User.findByIdAndUpdate(data.userId, {
            $push: { reviews: createdReview._id }
        });

        // Додавання до Book
        await Book.findByIdAndUpdate(data.bookId, {
            $push: { reviews: createdReview._id }
        });

        return createdReview;
    }

    async update(id, data) {
        const existingReview = await this.model.findById(id);
        if (!existingReview) {
            throw new Error('Review not found');
        }

        return await this.model.findByIdAndUpdate(id, data, { new: true });
    }
}

export default new ReviewService();
