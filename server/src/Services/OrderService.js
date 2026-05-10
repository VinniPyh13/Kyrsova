import Order from '../Models/Order.js';
import Product from '../Models/Product.js'; // Обов'язково імпортуємо модель товару
import BaseService from './BaseService.js';

class OrderService extends BaseService {
    constructor() {
        super(Order); 
    }

    // Перевизначаємо метод create для нашої кастомної логіки
    async create(orderData) {
        // 1. Спочатку створюємо замовлення через батьківський метод BaseService
        const newOrder = await super.create(orderData);

        // 2. Оновлюємо кількість товарів на складі
        if (orderData.items && orderData.items.length > 0) {
            for (const item of orderData.items) {
                // Знаходимо товар
                const product = await Product.findById(item.product);
                
                if (product && product.variants) {
                    // Знаходимо конкретну варіацію, яку купив клієнт
                    const variantIndex = product.variants.findIndex(
                        (v) => v.size === item.selectedSize && v.color === item.selectedColor
                    );

                    if (variantIndex !== -1) {
                        // Віднімаємо куплену кількість від залишку цієї варіації
                        product.variants[variantIndex].quantity -= item.quantity;

                        // Захист від від'ємного значення
                        if (product.variants[variantIndex].quantity < 0) {
                            product.variants[variantIndex].quantity = 0;
                        }

                        // Обов'язково вказуємо Mongoose, що масив об'єктів змінився
                        product.markModified('variants');
                    }

                    // Перераховуємо загальну кількість товару (як суму всіх варіацій)
                    product.quantity = product.variants.reduce((sum, v) => sum + v.quantity, 0);

                    // Зберігаємо оновлений товар
                    await product.save();
                }
            }
        }

        // Повертаємо створене замовлення
        return newOrder;
    }
}

export default new OrderService();