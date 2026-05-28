import ProductService from '../Services/ProductService.js';
import Product from '../Models/Product.js'; // ПЕРЕВІР ІМПОРТ МОДЕЛІ

class ProductController {
    async createProduct(req, res) {
        try {
            const product = await ProductService.create(req.body);
            return res.status(201).json(product);
        } catch (e) {
            res.status(400).json({ message: e.message });
        }
    }

    async getProduct(req, res) {
        try {
            const product = await ProductService.getOne(req.params.id);
            return res.json(product);
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }

    // ОПТИМІЗОВАНО: Отримання всіх товарів (включаючи запити від адмінки)
    async getProducts(req, res) {
        try {
            const { sort, fields } = req.query;

            // Якщо фронтенд просить сортування за популярністю
            if (sort === 'popular') {
                const products = await Product.find()
                    .sort({ salesCount: -1 })
                    .select(fields || ''); // Застосовуємо проєкцію, якщо вона передана
                return res.json(products);
            }

            // Якщо запит прийшов з адмінки, ми можемо передати кастомний фільтр/проєкцію в сервіс.
            // Якщо твій ProductService.getAll() приймає аргументи, передаємо туди.
            // Якщо ні — використовуємо модель напрямую для швидкості:
            let query = Product.find({});
            
            if (fields) {
                query = query.select(fields); // Витягуємо тільки потрібні поля
            }

            const products = await query;
            return res.json(products);
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }

    // ОПТИМІЗОВАНО: Фільтрація акційних товарів В КЛЮЧІ БАЗИ ДАНИХ (А не через .filter())
    async getSaleProducts(req, res) {
        try {
            // Запит робимо прямо в MongoDB Atlas: "дай тільки товари, де isSale: true"
            // Також за допомогою .select() обмежуємо поля для каталогу розпродажів
            const saleProducts = await Product.find({ isSale: true })
                .select('title price salePrice isSale brand images variants reviews');
                
            return res.json(saleProducts);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async updateProduct(req, res) {
        try {
            const updatedProduct = await ProductService.update(req.params.id, req.body);
            return res.json(updatedProduct);
        } catch (e) {
            res.status(400).json({ message: e.message });
        }
    }

    async deleteProduct(req, res) {
        try {
            await ProductService.delete(req.params.id);
            return res.json({ message: 'Товар успішно видалено' }); // Виправив одрук "видалена"
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }
}

export default new ProductController();