import mongoose from "mongoose";
import { uuid } from "uuidv4"; 
import Book from "./Book.js"; 
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

        bookId: {
            type: String,
            required: true,
            ref: 'Book',
        },

        comment:{
            type: String,
            required: true,
        }
    },{timestamps: true}
);

export default mongoose.model('Review', ReviewSchema);