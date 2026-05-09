import mongoose from "mongoose";
import { uuid } from "uuidv4"; 
const {Schema} = mongoose;
import Post from './Post.js'
import Cart from './Cart.js'
import Order from './Order.js'
import Role from './Role.js'


const UserSchema = new mongoose.Schema(
    {
        _id:{
            type: String,
            default: uuid,
        },

        name:{
            type: String,
            required: [true, "Ім'я обов'язкове"],
        },

        email:{
            type: String,
            required: [true, "Email обов'язковий"],
            unique: true,
        },

        password: {
            type: String,
            required: [true, "Пароль обов'язковий"],
        },

        phone: {
            type: String,
            required: [true, "Телефон обов'язковий"],
        },

        token: {
            type: String
        },

        reviews: [{
            type: String,
            ref: 'Review',
        }],

        fav_books: [{
            type: String,
            ref: 'Book',
        }],

        cart: {
            type: String,
            ref: 'Cart'
        },

        orders: [{
            type: String,
            ref: 'Order'
        }],

        roles: [{
            type: String,
            ref: 'Role'
        }]
    },{timestamps: true}
);

export default mongoose.model('User', UserSchema);