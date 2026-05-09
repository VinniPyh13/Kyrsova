// Models/Subcategory.js
import mongoose from 'mongoose';

const subcategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  categoryId: {
    type: String,  
    required: true
  }
}, { timestamps: true });

const Subcategory = mongoose.model('Subcategory', subcategorySchema);
export default Subcategory;