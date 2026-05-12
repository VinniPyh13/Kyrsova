import express from 'express';
import { chatWithAI, getChatHistory } from '../controllers/chatController.js';
import AuthMiddlewareHelper from '../Services/AuthMiddlewareHelper.js'; 

const router = express.Router();

// Використовуємо твій мідлвар для перевірки авторизації
router.post('/', [AuthMiddlewareHelper.authCheck], chatWithAI);
router.get('/history', [AuthMiddlewareHelper.authCheck], getChatHistory); 

export default router;