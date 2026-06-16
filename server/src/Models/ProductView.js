import mongoose from "mongoose";
import { uuid } from "uuidv4";

const ProductViewSchema = new mongoose.Schema({
  _id: { type: String, default: uuid },
  product: { type: String, ref: 'Product', required: true },
  source: { type: String, enum: ['direct', 'ai_assistant'], default: 'direct' },
}, { timestamps: true });

export default mongoose.model('ProductView', ProductViewSchema);
