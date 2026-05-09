/*import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Book from '../Models/Book.js'; // Перевірте правильність шляху
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadRouter = express.Router();

// Налаштування multer для зберігання у тимчасовій директорії
const upload = multer({ dest: path.join(__dirname, '../uploads/') }); // Зберігаємо в папці uploads

// Роут для завантаження зображення та перетворення в Base64
uploadRouter.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { bookId } = req.body; // Отримуємо ID книги з тіла запиту

    if (!bookId) {
      return res.status(400).json({ message: 'Не вказано ID книги' });
    }

    const file = req.file; // Отримуємо завантажений файл

    if (!file) {
      return res.status(400).json({ message: 'Файл не завантажено' });
    }

    // Перевірка існування книги
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Книга не знайдена' });
    }

    // Перетворюємо файл у Base64
    const filePath = path.join(__dirname, '../uploads', file.filename);
    const fileData = fs.readFileSync(filePath); // Читаємо файл з диску
    const base64Image = fileData.toString('base64'); // Перетворюємо в Base64

    // Оновлюємо модель книги, додаючи зображення в Base64
    const updatedBook = await Book.findByIdAndUpdate(
      bookId,
      { image: `data:image/jpeg;base64,${base64Image}` }, // Зберігаємо Base64 зображення
      { new: true }
    );

    // Видаляємо тимчасовий файл після перетворення
    fs.unlinkSync(filePath);

    return res.status(200).json({ message: 'Зображення успішно завантажено', book: updatedBook });
  } catch (error) {
    console.error('Error:', error);

    // Якщо була помилка при збереженні, видаляємо тимчасовий файл
    if (req.file) {
      const filePath = path.join(__dirname, '../uploads', req.file.filename);
      fs.unlinkSync(filePath);
    }

    res.status(500).json({ message: 'Помилка при завантаженні зображення', error: error.message });
  }
});*/

import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Book from '../Models/Book.js'; // Перевірте правильність шляху
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadRouter = express.Router();


// Роут для завантаження зображення та перетворення в Base64
const upload = multer({ dest: path.join(__dirname, '../uploads/') });

// Роут для завантаження кількох зображень
uploadRouter.post('/upload', upload.array('files', 5), async (req, res) => {
  try {
    const { bookId } = req.body;

    if (!bookId) {
      return res.status(400).json({ message: 'Не вказано ID книги' });
    }

    const files = req.files; // Отримуємо масив файлів

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'Файли не завантажено' });
    }

    // Перевірка існування книги
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Книга не знайдена' });
    }

    // Перетворюємо файли у Base64
    const images = [];
    for (let file of files) {
      const filePath = path.join(__dirname, '../uploads', file.filename);
      const fileData = fs.readFileSync(filePath);
      const base64Image = fileData.toString('base64');
      images.push(`data:image/jpeg;base64,${base64Image}`);

      // Видаляємо тимчасовий файл після перетворення
      fs.unlinkSync(filePath);
    }

    // Оновлюємо книгу, додаючи масив зображень
    const updatedBook = await Book.findByIdAndUpdate(
      bookId,
      { images }, // Оновлюємо масив зображень
      { new: true }
    );

    return res.status(200).json({ message: 'Зображення успішно завантажено', book: updatedBook });
  } catch (error) {
    console.error('Error:', error);

    if (req.files) {
      req.files.forEach(file => {
        const filePath = path.join(__dirname, '../uploads', file.filename);
        fs.unlinkSync(filePath);
      });
    }

    res.status(500).json({ message: 'Помилка при завантаженні зображення', error: error.message });
  }
});


export default uploadRouter;
