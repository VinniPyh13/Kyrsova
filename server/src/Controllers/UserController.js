import UserService from '../Services/UserService.js';
import Book from '../Models/Book.js'; // Add this import

class UserController {
    async createUser(req, res) {
        try {
            const user = await UserService.create(req.body);
            return res.status(201).json(user); // Ensure you are returning the user, not book
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
            console.log("Запит на отримання всіх користувачів"); // 👈 Додайф
            const users = await UserService.getAll();
            return res.json(users);
        } catch (e) {
            console.error("Помилка у getUsers:", e); // 👈 Додай
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
            const { userId, bookId } = req.body;
    
            const user = await UserService.getOne(userId);
            if (!user) return res.status(404).json({ message: 'Користувача не знайдено' });
    
            if (!user.fav_books.includes(bookId)) {
                user.fav_books.push(bookId);
                await user.save();
            }
    
            res.json({ message: 'Книга додана до обраного' });
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }

    async removeFromFavorites(req, res) {
        try {
            const { userId, bookId } = req.body;
            const user = await UserService.getOne(userId);
            if (!user) {
                return res.status(404).json({ message: 'Користувача не знайдено' });
            }

            const bookIndex = user.fav_books.findIndex(id => id.toString() === bookId.toString());
            
            if (bookIndex === -1) {
                return res.status(404).json({ message: 'Книгу не знайдено у списку обраних' });
            }
      
            user.fav_books.splice(bookIndex, 1);
            await user.save();
      
            return res.json({
                message: 'Книгу видалено з обраного',
                remainingFavorites: user.fav_books
            });
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }

    async getFavoriteBooks(req, res) {
        try {
            const { userId } = req.params;
            const user = await UserService.getOne(userId);
      
            if (!user) {
                return res.status(404).json({ message: 'Користувача не знайдено' });
            }

            // Get the favorite books by finding them in the Book collection
            const favoriteBooks = await Book.find({ _id: { $in: user.fav_books } });
      
            if (Array.isArray(favoriteBooks)) {
                res.json(favoriteBooks);
            } else {
                res.status(500).json({ message: 'Відповідь від сервера не є масивом' });
            }
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }
}

export default new UserController();
