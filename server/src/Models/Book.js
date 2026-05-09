import mongoose from "mongoose";
import Grid from 'gridfs-stream';
import { uuid } from "uuidv4"; 
const { Schema } = mongoose;

// Ініціалізуємо GridFS
const conn = mongoose.connection;
let gfs;
conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});

const BookSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: uuid,
    },

    title: {
      type: String,
      required: [true, "Назва книги обов'язкова"],
    },

    authorName: {
      type: String,
      required: [true, "Ім'я автора обов'язкове"],
    },

    price: {
      type: Number,
      required: true,
      min: [0, "Ціна не може бути від'ємною"]
    },

    description: {
      type: String,
      required: true,
    },

    categoryId: [{
      type: String,
      ref: 'Category',
    }],

    subcategories: [{
        type: String,
        ref: 'Subcategory',
    }],      

    reviews: [{
      type: String,
      ref: 'Review',
    }],

    quantity: {
      type: Number,
      required: true,
      min: [0, "Кількість не може бути від'ємною"],
      default: 0
    },

    
    images: [{
        type: String,
      }]

  }, { timestamps: true }
);

export default mongoose.model('Book', BookSchema);
