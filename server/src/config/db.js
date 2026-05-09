import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); // завантажує змінні з .env

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URL)
        .then(() => console.log('MongoDBConnected!'))
        .catch(() => console.log('Failed'));;
    } catch (err) {
        console.error('❌ Помилка підключення до MongoDB:', err);
        process.exit(1); // Вийти з процесу, якщо не вдалося підключитись
    }
};
