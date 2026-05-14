import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
    try {
        // Перевірка, чи взагака взагалі завантажився рядок з .env
        if (!process.env.DB_URL) {
            throw new Error("DB_URL не знайдено в файлі .env");
        }

        await mongoose.connect(process.env.DB_URL);
        console.log('✅ MongoDB Atlas Connected!');
    } catch (err) {
        console.error('❌ Помилка підключення до MongoDB:');
        // Виводимо повне повідомлення про помилку
        console.error(err.message); 
        
        // Якщо це помилка авторизації або IP
        if (err.message.includes('authentication failed')) {
            console.log('👉 Порада: Перевірте логін та пароль у .env');
        } else if (err.message.includes('querySrv ETIMEOUT')) {
            console.log('👉 Порада: Перевірте доступ до інтернету або налаштування IP Access в Atlas');
        }

        process.exit(1);
    }
};