import mongoose from "mongoose";
import { uuid } from "uuidv4"; 
const { Schema } = mongoose;

const CategorySchema = new Schema({
    _id: {
        type: String,
        default: uuid,
    },
    name: {
        type: String,
        required: [true, "Назва категорії обов'язкова"],
        unique: true,
    },

    subcategories: [{
        type: String,
        ref: 'Subcategory'
    }],

    description: {
        type: String,
    }
}, { timestamps: true });

export default mongoose.model('Category', CategorySchema);
