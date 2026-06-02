import ProductService from '../Services/ProductService.js';
import Product from '../Models/Product.js';

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
            const { sort, fields } = req.query;

            let query = sort === 'popular'
                ? Product.find().sort({ salesCount: -1 })
                : Product.find({});

            query = query.populate({ path: 'reviews', select: 'rating' });

            if (fields) {
                const fieldList = fields.split(' ');
                if (!fieldList.includes('reviews')) fieldList.push('reviews');
                query = query.select(fieldList.join(' '));
            }

            const products = await query;

            const productsWithRating = products.map(product => {
                const obj = product.toObject();
                const reviews = obj.reviews || [];
                const averageRating = reviews.length
                    ? Number((reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1))
                    : 0;
                return { ...obj, averageRating };
            });

            return res.json(productsWithRating);
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }

    async getSaleProducts(req, res) {
        try {
            const saleProducts = await Product.find({ isSale: true })
                .select('title price salePrice isSale brand images variants reviews')
                .populate({ path: 'reviews', select: 'rating' });

            const productsWithRating = saleProducts.map(product => {
                const obj = product.toObject();
                const reviews = obj.reviews || [];
                const averageRating = reviews.length
                    ? Number((reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1))
                    : 0;
                return { ...obj, averageRating };
            });

            return res.json(productsWithRating);
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
            return res.json({ message: 'Товар успішно видалено' });
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }
}

export default new ProductController();
