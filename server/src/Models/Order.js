import mongoose from "mongoose";
import { uuid } from "uuidv4"; 
const { Schema } = mongoose;

const OrderSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuid,
  },
  user: {
    type: String,
    ref: 'User',
    required: true,
  },
  contact: {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
  },
  items: [{
    book: {
      type: String,
      ref: 'Book',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    priceSnapshot: {
      type: Number,
      required: true,
    },
  }],
  total: {
    type: Number,
    required: true,
    min: [0, "Сума не може бути від'ємною"],
  },
  city: {
    type: String,
    required: true
  },
  warehouse: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['processing', 'shipped', 'delivered'],
    default: 'processing',
  },
  deliveryDate: {
    type: Date,
    required: true,
  },
  paymentMethod:{
    type:String,
    required: true
  },
    paypalPaymentId: {
    type: String, // або тип ObjectId, якщо плануєш прив’язувати до іншої моделі
  }
}, { timestamps: true });

export default mongoose.model('Order', OrderSchema);
