import User from '../Models/User.js';
import Role from '../Models/Role.js';
import { validationResult } from 'express-validator';
import bcryptjs from 'bcryptjs';
import 'dotenv/config';
import JWTcreator from '../Services/JWTcreator.js';
import EmailService from '../Services/EmailService.js';

// Тимчасове сховище очікуваних реєстрацій (email → { code, userData, expiresAt })
const pendingRegistrations = new Map();

class AuthController {
    async registration(req, res) {
        try {
            // Перевірка помилок валідації
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log('Validation Errors:', errors.array());
                return res.status(400).json({
                  errors: errors.array().map(err => ({
                    param: err.param,
                    msg: err.msg
                  }))
                });
              }              

            const { name, phone, email, password } = req.body;
            const user = await User.findOne({ 'email': email });
            if (user) {
                throw new Error('User is already registered');
            }

            const passwordHash = bcryptjs.hashSync(password, 10);
            const role = await Role.findOne({ 'name': 'USER' });
            if (!role) {
                throw new Error('Error in DB');
            }

            const newUser = await User.create({ name: name, phone: phone, email: email, password: passwordHash, roles: [role.name] });

            const token = JWTcreator.createToken({ _id: newUser._id, phone: phone, email: newUser.email, roles: newUser.roles });

            await User.findByIdAndUpdate(newUser._id, { token: token });

            return res.status(201).json({
                'token': token,
                'message': 'You are successfully registered!'
            });

        } catch (e) {
            return res.status(500).json({ message: e.message });
        }
    }

    async sendCode(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array().map(err => ({ param: err.param, msg: err.msg }))
                });
            }

            const { name, phone, email, password } = req.body;

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Користувач з таким email вже зареєстрований' });
            }

            const passwordHash = bcryptjs.hashSync(password, 10);
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = Date.now() + 10 * 60 * 1000;

            pendingRegistrations.set(email, { code, userData: { name, phone, email, passwordHash }, expiresAt });

            await EmailService.sendVerificationCode(email, code);

            return res.status(200).json({ message: 'Код надіслано на email' });
        } catch (e) {
            console.error('sendCode error:', e);
            return res.status(500).json({ message: 'Не вдалося надіслати код. Перевірте налаштування email.' });
        }
    }

    async verifyCode(req, res) {
        try {
            const { email, code } = req.body;

            if (!email || !code) {
                return res.status(400).json({ message: 'Email та код обов\'язкові' });
            }

            const pending = pendingRegistrations.get(email);

            if (!pending) {
                return res.status(400).json({ message: 'Спочатку запросіть код реєстрації' });
            }
            if (Date.now() > pending.expiresAt) {
                pendingRegistrations.delete(email);
                return res.status(400).json({ message: 'Код прострочений. Зареєструйтесь знову' });
            }
            if (pending.code !== code.trim()) {
                return res.status(400).json({ message: 'Невірний код' });
            }

            const role = await Role.findOne({ name: 'USER' });
            if (!role) return res.status(500).json({ message: 'Помилка бази даних' });

            const { name, phone, passwordHash } = pending.userData;
            const newUser = await User.create({ name, phone, email, password: passwordHash, roles: [role.name] });

            const token = JWTcreator.createToken({ _id: newUser._id, phone, email, roles: newUser.roles });
            await User.findByIdAndUpdate(newUser._id, { token });

            pendingRegistrations.delete(email);

            return res.status(201).json({ token, message: 'Реєстрація успішна!' });
        } catch (e) {
            console.error('verifyCode error:', e);
            return res.status(500).json({ message: e.message });
        }
    }

    async login(req, res) {
        try {

            const {email, password} = req.body;
            const user = await User.findOne({email});
            
            if (!user){
                throw new Error('User is not registered');
            }

            const passwordValid = bcryptjs.compareSync(password, user.password);

            if(!passwordValid){
                throw new Error('Password is incorrect!')
            }

            const newToken = JWTcreator.createToken({_id: user._id, email: user.email, roles: user.roles});

            await User.findByIdAndUpdate(user._id, {token: newToken});

            return res.status(200).json({
                'token': newToken,
                'message': 'You are successfully loginedd!',
                'data': user
            });

        } catch (e) {
            return res.status(500).json({ message: e.message });
        }
    }


}

export default new AuthController();
