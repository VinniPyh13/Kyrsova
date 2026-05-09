import BaseService from './BaseService.js';
import Cart from '../Models/Cart.js';
import Book from '../Models/Book.js';

class CartService extends BaseService {
    constructor() {
        super(Cart);
    }

    async getCartByUser(userID) {
        if (!userID) {
            throw new Error('User ID is required');
        }

        const cart = await this.model.findOne({ user: userID }).populate('items.book');
        if (!cart) throw new Error('Cart not found');
        return cart;
    }

    async updateCartByUser(userID, data) {
        if (!userID) throw new Error('User ID is required');
        const updatedCart = await this.model.findOneAndUpdate(
            { user: userID },
            data,
            { new: true, upsert: true }
        ).populate('items.book');
        return updatedCart;
    }

    async deleteCartByUser(userID) {
        if (!userID) throw new Error('User ID is required');

        const cart = await this.model.findOne({ user: userID });
        if (!cart) throw new Error('Cart not found');

        // Повертаємо всі кількості книг
        for (const item of cart.items) {
            const book = await Book.findById(item.book);
            if (book) {
                book.quantity += item.quantity;
                await book.save();
            }
        }

        await this.model.deleteOne({ user: userID });
        return { message: "Cart deleted successfully" };
    }

    async addItem(userID, bookID, quantity = 1, price) {
        if (!userID || !bookID) throw new Error("User ID та Book ID обов'язкові");

        const book = await Book.findById(bookID);
        if (!book) throw new Error("Книга не знайдена");

        if (book.quantity < quantity) {
            throw new Error(`Лише ${book.quantity} книг доступно`);
        }

        book.quantity -= quantity;
        await book.save();

        let cart = await this.model.findOne({ user: userID });
        if (!cart) {
            cart = await this.model.create({
                user: userID,
                items: [],
                total: 0
            });
        }

        const existingItemIndex = cart.items.findIndex(item => item.book.toString() === bookID);
        if (existingItemIndex !== -1) {
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            cart.items.push({ book: bookID, quantity, priceSnapshot: price });
        }

        cart.total = cart.items.reduce((sum, item) => sum + item.quantity * item.priceSnapshot, 0);
        await cart.save();

        return cart.populate('items.book');
    }

    async removeItem(userID, bookID, quantity = 1) {
        if (!userID || !bookID) throw new Error('UserID and BookID are required');

        const cart = await this.model.findOne({ user: userID });
        if (!cart) throw new Error('Cart not found');

        const itemIndex = cart.items.findIndex(item => item.book.toString() === bookID);
        if (itemIndex === -1) throw new Error('Book not in cart');

        const item = cart.items[itemIndex];

        // Повертаємо кількість книги
        const book = await Book.findById(bookID);
        if (book) {
            book.quantity += Math.min(quantity, item.quantity);
            await book.save();
        }

        if (item.quantity > quantity) {
            item.quantity -= quantity;
        } else {
            cart.items.splice(itemIndex, 1);
        }

        cart.total = cart.items.reduce((sum, item) => sum + item.quantity * item.priceSnapshot, 0);
        await cart.save();

        return cart.populate('items.book');
    }
}

export default new CartService();
