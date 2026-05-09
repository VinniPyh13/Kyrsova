import UserService from '../Services/UserService.js';
import Product from '../Models/Product.js'; 

class UserController {
    async createUser(req, res) {
        try {
            const user = await UserService.create(req.body);
            return res.status(201).json(user); 
        } catch (e) {
            res.status(400).json({ message: e.message });
        }
    }

    async getUser(req, res) {
        try {
            const user = await UserService.getOne(req.params.id);
            return res.json(user);
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }

    async getUsers(req, res) {
        try {
            console.log("Запит на отримання всіх користувачів"); 
            const users = await UserService.getAll();
            return res.json(users);
        } catch (e) {
            console.error("Помилка у getUsers:", e); 
            res.status(500).json({ message: e.message });
        }
    }

    async getCurrentUser(req, res) {
        try {
            const user = req.user;
            res.json(user);
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }

    async updateUser(req, res) {
        try {
            const updatedUser = await UserService.update(req.params.id, req.body);
            return res.json(updatedUser);
        } catch (e) {
            res.status(400).json({ message: e.message });
        }
    }

    async deleteUser(req, res) {
        try {
            await UserService.delete(req.params.id);
            return res.json({ message: 'Юзер успішно видалений' });
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }

    async addToFavorites(req, res) {
        try {
            const { userId, productId } = req.body;
    
            const user = await UserService.getOne(userId);
            if (!user) return res.status(404).json({ message: 'Користувача не знайдено' });
    
            if (!user.fav_products.includes(productId)) {
                user.fav_products.push(productId);
                await user.save();
            }
    
            res.json({ message: 'Товар додано до обраного' });
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }

    async removeFromFavorites(req, res) {
        try {
            const { userId, productId } = req.body;
            const user = await UserService.getOne(userId);
            if (!user) {
                return res.status(404).json({ message: 'Користувача не знайдено' });
            }

            const productIndex = user.fav_products.findIndex(id => id.toString() === productId.toString());
            
            if (productIndex === -1) {
                return res.status(404).json({ message: 'Товар не знайдено у списку обраних' });
            }
      
            user.fav_products.splice(productIndex, 1);
            await user.save();
      
            return res.json({
                message: 'Товар видалено з обраного',
                remainingFavorites: user.fav_products
            });
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }

    async getFavoriteProducts(req, res) {
        try {
            const { userId } = req.params;
            const user = await UserService.getOne(userId);
      
            if (!user) {
                return res.status(404).json({ message: 'Користувача не знайдено' });
            }

            // ВИПРАВЛЕНО: Шукаємо у колекції Product замість Book
            const favoriteProducts = await Product.find({ _id: { $in: user.fav_products } });
      
            if (Array.isArray(favoriteProducts)) {
                res.json(favoriteProducts);
            } else {
                res.status(500).json({ message: 'Відповідь від сервера не є масивом' });
            }
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }
}

export default new UserController();