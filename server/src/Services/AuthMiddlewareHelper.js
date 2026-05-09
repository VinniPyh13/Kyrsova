import 'dotenv/config';
import jwt from 'jsonwebtoken';
import User from '../Models/User.js';

class AuthMiddlewareHelper {

    async authCheck(req, res, next) {
        try {
            // 1. БЕЗПЕЧНА ПЕРЕВІРКА: спочатку перевіряємо, чи взагалі є заголовок
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ message: "Authorization token missing or invalid format" });
            }

            // 2. Тепер безпечно сплітуємо
            const token = authHeader.split(' ')[1];

            // 3. Декодуємо токен
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);    
            const user = await User.findOne({ _id: decoded._id });

            if (!user) {
                return res.status(401).json({ message: 'This user is unknown!' });
            }
            if (user.token !== token) {
                return res.status(401).json({ message: 'Token is fake or expired!' });
            }
            
            // 4. Передаємо користувача далі
            req.user = user;
            next();

        } catch (e) {
            // Краще повертати JSON з повідомленням про помилку для зручності дебагу
            return res.status(401).json({ message: 'Authorization failed!!', error: e.message });
        }
    }

    roleCheck(role) {
        return function(req, res, next) {
            try {
                // ТУТ ТАКОЖ ПОТРІБНА БЕЗПЕЧНА ПЕРЕВІРКА
                const authHeader = req.headers.authorization;
                if (!authHeader || !authHeader.startsWith('Bearer ')) {
                    return res.status(401).json({ message: "Authorization token missing" });
                }

                const token = authHeader.split(' ')[1];
    
                const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
                const userRoles = decoded.roles || []; // Захист, якщо roles немає в токені
                
                if (!userRoles.includes(role)) {
                    return res.status(403).json({ message: 'You haven`t this role!' });
                }

                next();
            } catch (e) {
                return res.status(403).json({ message: 'You haven`t access to this function!' });
            }
        }
    }
}

export default new AuthMiddlewareHelper();