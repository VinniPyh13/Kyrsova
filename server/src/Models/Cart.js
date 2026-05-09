import mongoose from "mongoose";
import { uuid } from "uuidv4";

const CartSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: uuid,
    },
    user: {
        type: String,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [{
        book: {
            type: String,
            ref: 'Book',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            default: 1,
            min: 1
        },
        priceSnapshot: {
            type: Number,
            required: true
        }
    }],
    total: {
        type: Number,
        default: 0
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 днів
        index: { expires: 0 }
    }
}, { timestamps: true });

export default mongoose.model('Cart', CartSchema);