import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../server/.env') });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INPUT_FILE = path.join(__dirname, 'products.json');

const ProductSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    title: { type: String, required: true },
    brand: { type: String, required: true },
    price: { type: Number, required: true },
    salePrice: { type: Number },
    isSale: { type: Boolean, default: false },
    description: { type: String, required: true },
    gender: { type: String, enum: ['Чоловічий', 'Жіночий', 'Унісекс', 'Дитячий'], required: true },
    variants: [{ size: String, color: String, quantity: Number }],
    material: { type: String },
    categoryId: [{ type: String }],
    images: [{ type: String }],
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', ProductSchema);

// UUID v4 pattern
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
// MongoDB ObjectId pattern (24 hex chars)
const OBJECTID_REGEX = /^[0-9a-f]{24}$/i;

const JUNK_COLOR_PATTERNS = [
  'підібрати', 'доставка', 'наявність', 'категорія', 'бренд',
  'розміри', 'деякі', 'закінчуються', 'оплата', 'повернення', 'магазинах'
];

function cleanVariants(variants) {
  if (!Array.isArray(variants) || variants.length === 0) {
    return [{ size: 'XS', color: 'Чорний', quantity: 10 }];
  }

  // Filter out scraping artifacts from colors
  const cleaned = variants.filter(v => {
    if (!v.color) return false;
    const lower = v.color.toLowerCase();
    return !JUNK_COLOR_PATTERNS.some(j => lower.includes(j)) && v.color.length < 30;
  });

  if (cleaned.length === 0) {
    // No valid colors — use unique sizes with default color
    const sizes = [...new Set(variants.map(v => v.size).filter(s => s && /^(XXS|XS|S|M|L|XL|XXL|XXXL|\d{2,3})$/i.test(s)))];
    if (sizes.length === 0) sizes.push(...['XS', 'S', 'M', 'L', 'XL']);
    return sizes.map(size => ({ size, color: 'Чорний', quantity: 10 }));
  }

  // Remove duplicate size+color combos
  const seen = new Set();
  return cleaned.filter(v => {
    const key = `${v.size}_${v.color}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function main() {
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`Файл ${INPUT_FILE} не знайдено. Спочатку запустіть scraper.js`);
    process.exit(1);
  }

  const products = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));
  console.log(`Завантажено ${products.length} товарів з файлу.`);

  const mongoUrl = process.env.DB_URL || process.env.DB_URL1 || process.env.MONGO_URL;
  await mongoose.connect(mongoUrl);
  console.log('Підключено до MongoDB.');

  // Step 1: find and delete all products with ObjectId _id (24 hex chars)
  const db = mongoose.connection.db;
  const collection = db.collection('products');

  const allDocs = await collection.find({}, { projection: { _id: 1 } }).toArray();
  const objectIdDocs = allDocs.filter(doc => {
    const id = String(doc._id);
    return OBJECTID_REGEX.test(id) && !UUID_REGEX.test(id);
  });

  if (objectIdDocs.length > 0) {
    const idsToDelete = objectIdDocs.map(d => d._id);
    await collection.deleteMany({ _id: { $in: idsToDelete } });
    console.log(`Видалено ${objectIdDocs.length} товарів з ObjectId _id.`);
  } else {
    console.log('Товарів з ObjectId _id не знайдено.');
  }

  // Step 2: insert products from JSON with proper UUID _id and clean variants
  let inserted = 0;
  let skipped = 0;

  for (const p of products) {
    if (!p.title || p.price <= 0) { skipped++; continue; }

    try {
      await Product.create({
        _id: uuidv4(),
        title: p.title,
        brand: p.brand || 'Staff',
        price: p.price,
        salePrice: p.salePrice,
        isSale: p.isSale || false,
        description: p.description || p.title,
        gender: p.gender || 'Унісекс',
        variants: cleanVariants(p.variants),
        material: p.material || '',
        images: p.images || [],
      });
      inserted++;
      process.stdout.write(`Імпортовано: ${inserted}/${products.length}\r`);
    } catch (err) {
      console.warn(`\nПропущено "${p.title}": ${err.message}`);
      skipped++;
    }
  }

  console.log(`\nГотово! Додано: ${inserted}, пропущено: ${skipped}`);
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Помилка:', err);
  process.exit(1);
});
