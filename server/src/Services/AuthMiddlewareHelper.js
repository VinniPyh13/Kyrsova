import 'dotenv/config';
import jwt from 'jsonwebtoken';
import User from '../Models/User.js';

class AuthMiddlewareHelper {

    async authCheck(req, res, next) {
        try {
            // 1. БЕЗПЕЧНА ПЕРЕВІРКА заголовка
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ message: "Authorization token missing or invalid format" });
            }

            // 2. Дістаємо токен
            const token = authHeader.split(' ')[1];

            // 3. Декодуємо токен і шукаємо користувача
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);    
            const user = await User.findOne({ _id: decoded._id });

            if (!user) {
                return res.status(401).json({ message: 'This user is unknown!' });
            }
            if (user.token !== token) {
                return res.status(401).json({ message: 'Token is fake or expired!' });
            }
            
            // 4. Передаємо користувача далі (це дуже важливо для roleCheck!)
            req.user = user;
            next();

        } catch (e) {
            return res.status(401).json({ message: 'Authorization failed!!', error: e.message });
        }
    }

    roleCheck(requiredRole) {
        return function(req, res, next) {
            try {
                // Оскільки authCheck відпрацював першим, ми ВЖЕ маємо користувача в req.user
                if (!req.user) {
                    return res.status(401).json({ message: "User not authenticated" });
                }

                // ПЕРЕВІРКА МАСИВУ РОЛЕЙ
                // Перевіряємо, чи існує поле roles, чи це масив, і чи є там необхідна роль
                if (!req.user.roles || !Array.isArray(req.user.roles) || !req.user.roles.includes(requiredRole)) {
                    return res.status(403).json({ message: "You don't have this role!" });
                }

                // Якщо все добре — пропускаємо далі до контролера
                next();
            } catch (e) {
                return res.status(403).json({ message: "Access denied", error: e.message });
            }
        }
    }
}

export default new AuthMiddlewareHelper();