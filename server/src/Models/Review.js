import mongoose from "mongoose";
import { uuid } from "uuidv4"; 
import Product from "./Product.js"; 
import User from "./User.js";
const {Schema} = mongoose;

const ReviewSchema = new mongoose.Schema(
    {
        _id:{
            type: String,
            default: uuid,
        },

        userId: {
            type: String,
            ref: 'User',
            required: true,
        },

        rating:{
            type: Number,
            min: [1, "Мінімальна оцінка - 1"],
            max: [5, "Максимальна оцінка - 5"],
            default: 0,
        },

        productId: {
            type: String,
            required: true,
            ref: 'Product',
        },

        comment:{
            type: String,
            required: true,
        }
    },{timestamps: true}
);

export default mongoose.model('Review', ReviewSchema);