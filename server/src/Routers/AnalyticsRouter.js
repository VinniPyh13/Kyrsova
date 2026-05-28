import { Router } from 'express';
import { getAdminAnalytics } from '../Controllers/analyticsController.js';
import AuthMiddlewareHelper from '../Services/AuthMiddlewareHelper.js'; // Імпортуємо твій захист

const router = new Router();

// Додаємо мідлвару перевірки токена перед викликом контролера
router.get('/', [AuthMiddlewareHelper.authCheck], getAdminAnalytics); 

export default router;