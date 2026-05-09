//import PostService from '../Services/PostService.js';
import User from '../Models/User.js';
import Role from '../Models/Role.js';
import { validationResult } from 'express-validator';
import bcryptjs from 'bcryptjs';
import 'dotenv/config';
import JWTcreator from '../Services/JWTcreator.js';

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
