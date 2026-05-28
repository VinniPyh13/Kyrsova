import CartService from '../Services/CartService.js';

class CartController {
    async getCarts(req, res) {
        try {
            const carts = await CartService.getAll();
            return res.json(carts);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async getCartByUser(req, res) {
        try {
            console.log("Запит на отримання кошика");
            const userID = req.user._id;
            const cart = await CartService.getCartByUser(userID);
            return res.json(cart);
        } catch (err) {
            res.status(404).json({ message: err.message });
        }
    }

    async createCart(req, res) {
        try {
            const newCart = await CartService.create(req.body);
            return res.status(201).json(newCart);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

    async updateCart(req, res) {
        try {
            const userID = req.params.userID;
            const updatedCart = await CartService.updateCartByUser(userID, req.body);
            return res.json(updatedCart);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

    async deleteCart(req, res) {
        try {
            const userID = req.params.userID;
            await CartService.deleteCartByUser(userID);
            return res.json({ message: 'Cart deleted successfully' });
        } catch (err) {
            res.status(404).json({ message: err.message });
        }
    }

    // ВИПРАВЛЕНИЙ МЕТОД ДОДАВАННЯ
    async addItemToCart(req, res) {
        try {
            const userID = req.user._id;
            // Беремо productID, розмір та колір замість bookID
            const { productID, quantity, selectedSize, selectedColor } = req.body;

            // Передаємо всі нові параметри у сервіс
            const updatedCart = await CartService.addItem(
                userID, 
                productID, 
                quantity, 
                selectedSize, 
                selectedColor
            );
            return res.status(200).json(updatedCart);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

    // ВИПРАВЛЕНИЙ МЕТОД ВИДАЛЕННЯ
    async removeItemFromCart(req, res) {
        try {
            const userID = req.user._id;
            // Беремо productID, розмір та колір замість bookID
            const { productID, quantity, selectedSize, selectedColor } = req.body;

            // Передаємо всі нові параметри у сервіс (порядок має збігатися з методом у CartService)
            const updatedCart = await CartService.removeItem(
                userID, 
                productID, 
                selectedSize, 
                selectedColor, 
                quantity
            );
            return res.json(updatedCart);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }
    
}

export default new CartController();