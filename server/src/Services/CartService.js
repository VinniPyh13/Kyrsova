import BaseService from './BaseService.js';
import Cart from '../Models/Cart.js';
import Product from '../Models/Product.js';

class CartService extends BaseService {
    constructor() {
        super(Cart);
    }

    async getCartByUser(userID) {
        if (!userID) {
            throw new Error('User ID is required');
        }

        const cart = await this.model.findOne({ user: userID }).populate('items.product');
        if (!cart) throw new Error('Cart not found');
        return cart;
    }

    async updateCartByUser(userID, data) {
        if (!userID) throw new Error('User ID is required');
        const updatedCart = await this.model.findOneAndUpdate(
            { user: userID },
            data,
            { new: true, upsert: true }
        ).populate('items.product');
        return updatedCart;
    }

    async deleteCartByUser(userID) {
        if (!userID) throw new Error('User ID is required');

        const cart = await this.model.findOne({ user: userID });
        if (!cart) throw new Error('Cart not found');

        // Повертаємо всі кількості книг
        for (const item of cart.items) {
            const product = await Product.findById(item.product);
            if (product) {
                product.quantity += item.quantity;
                await product.save();
            }
        }

        await this.model.deleteOne({ user: userID });
        return { message: "Cart deleted successfully" };
    }

    // Ми прибрали параметр price, бо бекенд сам його знайде
    async addItem(userID, productID, quantity = 1, selectedSize, selectedColor, addedVia = 'direct') {
        if (!userID || !productID || !selectedSize || !selectedColor) {
            throw new Error("UserID, ProductID, розмір та колір обов'язкові");
        }

        const product = await Product.findById(productID);
        if (!product) throw new Error("Товар не знайдено");

        if (product.quantity < quantity) {
            throw new Error(`Лише ${product.quantity} одиниць доступно`);
        }

        product.quantity -= quantity;
        await product.save();

        // 🚨 БЕЗПЕКА: Визначаємо АКТУАЛЬНУ ціну прямо з бази
        const actualPrice = (product.isSale && product.salePrice) ? product.salePrice : product.price;

        let cart = await this.model.findOne({ user: userID });
        if (!cart) {
            cart = await this.model.create({ user: userID, items: [], total: 0 });
        }

        const existingItemIndex = cart.items.findIndex(
            item => item.product.toString() === productID && 
                    item.selectedSize === selectedSize && 
                    item.selectedColor === selectedColor
        );

        if (existingItemIndex !== -1) {
            cart.items[existingItemIndex].quantity += quantity;
            // Оновлюємо priceSnapshot на випадок, якщо ціна змінилася, поки товар лежав у кошику
            cart.items[existingItemIndex].priceSnapshot = actualPrice; 
        } else {
            cart.items.push({
                product: productID,
                quantity,
                priceSnapshot: actualPrice, // Записуємо справжню ціну
                selectedSize,
                selectedColor,
                addedVia: addedVia === 'ai_assistant' ? 'ai_assistant' : 'direct'
            });
        }

        cart.total = cart.items.reduce((sum, item) => sum + item.quantity * item.priceSnapshot, 0);
        await cart.save();

        return cart.populate('items.product');
    }

async removeItem(userID, productID, selectedSize, selectedColor, quantity = 1) {
        // Додали перевірку на наявність розміру та кольору
        if (!userID || !productID || !selectedSize || !selectedColor) {
            throw new Error("UserID, ProductID, розмір та колір обов'язкові");
        }

        const cart = await this.model.findOne({ user: userID });
        if (!cart) throw new Error('Кошик не знайдено');

        // Шукаємо конкретну варіацію товару в кошику (за ID, розміром та кольором)
        const itemIndex = cart.items.findIndex(item => 
            item.product.toString() === productID && 
            item.selectedSize === selectedSize && 
            item.selectedColor === selectedColor
        );
        
        if (itemIndex === -1) throw new Error('Товар з такими параметрами не знайдено у кошику');

        const item = cart.items[itemIndex];

        // Повертаємо кількість товару на склад (замінили Book на Product)
        const product = await Product.findById(productID);
        if (product) {
            product.quantity += Math.min(quantity, item.quantity);
            await product.save();
        }

        // Зменшуємо кількість у кошику або повністю видаляємо позицію
        if (item.quantity > quantity) {
            item.quantity -= quantity;
        } else {
            cart.items.splice(itemIndex, 1);
        }

        // Перераховуємо загальну вартість кошика
        cart.total = cart.items.reduce((sum, currentItem) => sum + currentItem.quantity * currentItem.priceSnapshot, 0);
        await cart.save();

        // Повертаємо оновлений кошик (замінили items.product на items.product)
        return cart.populate('items.product');
    }
}

export default new CartService();
