import Order from '../Models/Order.js';
import Product from '../Models/Product.js'; 
import BaseService from './BaseService.js';

class OrderService extends BaseService {
    constructor() {
        super(Order); 
    }

    async create(orderData) {
        // 1. Створюємо замовлення
        const newOrder = await super.create(orderData);

        // 2. Оновлюємо кількість товарів на складі та інкрементуємо популярність
        if (orderData.items && orderData.items.length > 0) {
            for (const item of orderData.items) {
                // Знаходимо товар (item.product зазвичай містить ID)
                const product = await Product.findById(item.product);
                
                if (product) {
                    // --- ТВОЯ ЛОГІКА ЗМЕНШЕННЯ СКЛАДУ ---
                    if (product.variants) {
                        const variantIndex = product.variants.findIndex(
                            (v) => v.size === item.selectedSize && v.color === item.selectedColor
                        );

                        if (variantIndex !== -1) {
                            product.variants[variantIndex].quantity -= item.quantity;

                            if (product.variants[variantIndex].quantity < 0) {
                                product.variants[variantIndex].quantity = 0;
                            }
                            product.markModified('variants');
                        }

                        product.quantity = product.variants.reduce((sum, v) => sum + v.quantity, 0);
                    }

                    // --- НАША НОВА ЛОГІКА ПОПУЛЯРНОСТІ ---
                    // Збільшуємо лічильник продажів на кількість куплених одиниць
                    product.salesCount += item.quantity;

                    // Зберігаємо оновлений товар
                    await product.save();
                }
            }
        }

        return newOrder;
    }
}

export default new OrderService();