import ProductService from '../Services/ProductService.js';

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

    async getProducts(req, res) {
        try {
            const products = await ProductService.getAll();
            return res.json(products);
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }

    async getSaleProducts(req, res) {
        try {
            // Шукаємо лише ті товари, де isSale === true
            const saleProducts = await Product.find({ isSale: true });
            res.status(200).json(saleProducts);
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
            return res.json({ message: 'Товар успішно видалена' });
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }
}

export default new ProductController();
