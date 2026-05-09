import mongoose from "mongoose";
import Grid from 'gridfs-stream';
import { uuid } from "uuidv4"; 
const { Schema } = mongoose;

// Ініціалізуємо GridFS (залишив твій код для завантаження зображень)
const conn = mongoose.connection;
let gfs;
conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});

const ProductSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuid },
    
    title: { 
      type: String, 
      required: [true, "Назва товару обов'язкова"] 
    },
    
    brand: { 
      type: String, 
      required: [true, "Бренд обов'язковий"] // Замість authorName
    },

    price: { 
      type: Number, 
      required: true, 
      min: [0, "Ціна не може бути від'ємною"] 
    },
    
    salePrice: { 
      type: Number, 
      min: [0, "Акційна ціна не може бути від'ємною"] 
    },

    isSale: {
      type: Boolean,
      default: false
    },

    description: { type: String, required: true },

    gender: {
      type: String,
      enum: ['Чоловічий', 'Жіночий', 'Унісекс', 'Дитячий'],
      required: true
    },
    
    colors: [{ type: String }],
    
    sizes: [{ type: String }],
    
    material: { type: String },

    categoryId: [{ type: String, ref: 'Category' }],
    subcategories: [{ type: String, ref: 'Subcategory' }],
    
    reviews: [{ type: String, ref: 'Review' }],
    
    quantity: { 
      type: Number, 
      required: true, 
      min: [0, "Кількість не може бути від'ємною"], 
      default: 0 
    },
    
    images: [{ type: String }]
  }, { timestamps: true }
);

export default mongoose.model('Product', ProductSchema);