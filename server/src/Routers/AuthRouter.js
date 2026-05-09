import express from 'express';
import AuthController from '../Controllers/AuthController.js';
import { check } from 'express-validator';
import AuthMiddlewareHelper from '../Services/AuthMiddlewareHelper.js';

const authRouter = express.Router();

authRouter.post('/registration', [
    // Валідація телефону
    check('phone')
        .notEmpty().withMessage('Phone number is required')
        .isMobilePhone().withMessage('Invalid phone number format')
        .bail(),
    
    // Валідація email
    check('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail()
        .bail(),
    
    // Валідація пароля
    check('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6, max: 16 }).withMessage('Password must be 6-16 characters long')
        .matches(/\d/).withMessage('Password must contain at least one number')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .bail()
], 
AuthController.registration);

authRouter.post('/login', [
    check('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format'),
    
    check('password')
        .notEmpty().withMessage('Password is required')
], 
AuthController.login);

export default authRouter;