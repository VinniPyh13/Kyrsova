import mongoose from "mongoose";
import Grid from 'gridfs-stream';
import { uuid } from "uuidv4"; 
const { Schema } = mongoose;

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
      required: [true, "Бренд обов'язковий"]
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
    
    /*colors: [{ type: String }],
    
    sizes: [{ type: String }],
    quantity: { 
      type: Number, 
      required: true, 
      min: [0, "Кількість не може бути від'ємною"], 
      default: 0 
    },*/

  variants: [
    {
      size: { type: String, required: true },
      color: { type: String, required: true },
      quantity: { type: Number, required: true, min: 0 }
    }
  ],

    
    material: { type: String },
    categoryId: [{ type: String, ref: 'Category' }],
    subcategories: [{ type: String, ref: 'Subcategory' }],
    reviews: [{ type: String, ref: 'Review' }],
    salesCount: { 
      type: Number, 
      default: 0, 
      index: true // Обов'язково для швидкого сортування у великій базі
    },
    images: [{ type: String }]
  }, { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

export default Product;