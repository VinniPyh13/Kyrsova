import BaseService from './BaseService.js';
import Review from '../Models/Review.js';
import User from '../Models/User.js';
import Product from '../Models/Product.js';

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
        const productExists = await Product.findById(data.productId);
        if (!productExists) {
            throw new Error('product does not exist');
        }

        // Створення відгуку
        const createdReview = await this.model.create(data);

        // Додавання до User
        await User.findByIdAndUpdate(data.userId, {
            $push: { reviews: createdReview._id }
        });

        // Додавання до Book
        await Product.findByIdAndUpdate(data.productId, {
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

    // Services/ReviewService.js

    async delete(id) {
        const review = await this.model.findById(id);
        if (!review) {
            throw new Error('Review not found');
        }

        // 1. Видаляємо відгук з БД
        await this.model.findByIdAndDelete(id);

        // 2. Очищаємо масив у користувача
        await User.findByIdAndUpdate(review.userId, {
            $pull: { reviews: id }
        });

        // 3. Очищаємо масив у товару
        await Product.findByIdAndUpdate(review.productId, {
            $pull: { reviews: id }
        });

        return { message: "Review successfully deleted and references removed" };
    }
}

export default new ReviewService();
