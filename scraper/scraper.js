import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

puppeteerExtra.use(StealthPlugin());

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BASE_URL = 'https://www.staff-clothes.com';
const CATEGORY_URL = 'https://www.staff-clothes.com/w/kofty-svitshoty/c1020/';
const OUTPUT_FILE = path.join(__dirname, 'products.json');
const DIAG_FILE = path.join(__dirname, 'diag.html');
const DELAY = 1200;
const MAX_PRODUCTS = 6;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function detectGender(text) {
  if (!text) return 'Унісекс';
  const lower = text.toLowerCase();
  if (lower.includes('жін') || lower.includes('women') || lower.includes('girl')) return 'Жіночий';
  if (lower.includes('чол') || lower.includes('men') || lower.includes('boy')) return 'Чоловічий';
  if (lower.includes('діт') || lower.includes('kid') || lower.includes('child')) return 'Дитячий';
  return 'Унісекс';
}

// --- Збираємо посилання на товари з каталогу ---
async function getProductLinks(page, startUrl) {
  const allLinks = new Set();
  let pageNum = 1;

  while (true) {
    const url = pageNum === 1 ? startUrl : `${startUrl}?PAGEN_1=${pageNum}`;
    console.log(`  Каталог сторінка ${pageNum}: ${url}`);

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(DELAY);

    const { links, hasNext } = await page.evaluate((base) => {
      const found = new Set();
      document.querySelectorAll(`a[href*="/product/"]`).forEach(a => {
        found.add(a.href.split('?')[0]);
      });
      const hasNext = !!document.querySelector('a[rel="next"], a.next, [class*="next"]');
      return { links: [...found], hasNext };
    }, BASE_URL);

    links.forEach(l => allLinks.add(l));
    console.log(`    +${links.length} (всього: ${allLinks.size})`);

    if (!hasNext || links.length === 0) break;
    pageNum++;
    await sleep(DELAY);
  }

  return [...allLinks];
}

// --- Зберігаємо HTML першого товару для діагностики ---
async function dumpProductHtml(page, url) {
  console.log(`\nДіагностика: ${url}`);
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(1500);

  const html = await page.content();
  fs.writeFileSync(DIAG_FILE, html, 'utf-8');
  console.log(`HTML сторінки товару збережено у: ${DIAG_FILE}`);

  // Виводимо ключові дані в консоль
  const info = await page.evaluate(() => {
    const h1s = [...document.querySelectorAll('h1')].map(el => ({
      class: el.className, text: el.innerText.trim().slice(0, 80)
    }));
    const priceCandidates = [...document.querySelectorAll('[class*="price"],[class*="Price"],[itemprop="price"],[class*="cost"],[class*="Cost"]')]
      .map(el => ({ class: el.className, text: el.innerText.trim().slice(0, 50), attr: el.getAttribute('content') || '' }));
    const imgSrcs = [...document.querySelectorAll('img')]
      .map(img => img.dataset.src || img.dataset.lazySrc || img.src)
      .filter(src => src && !src.includes('data:') && src.includes('http'))
      .slice(0, 8);
    const allClasses = [...new Set(
      [...document.querySelectorAll('[class]')].flatMap(el => [...el.classList]).filter(c => c.length > 2)
    )];
    return { h1s, priceCandidates, imgSrcs, allClasses };
  });

  console.log('\nH1 теги:');
  info.h1s.forEach(h => console.log(`  [${h.class}] "${h.text}"`));
  console.log('\nЕлементи з "price" у класі:');
  info.priceCandidates.forEach(p => console.log(`  [${p.class}] "${p.text}" content="${p.attr}"`));
  console.log('\nЗображення:');
  info.imgSrcs.forEach(src => console.log(' ', src));
  console.log('\nВсі CSS класи:', info.allClasses.join(', '));
}

// --- Парсити сторінку товару (після діагностики підберемо правильні селектори) ---
async function parseProduct(page, url, genderHint = '') {
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(900);

    const product = await page.evaluate(() => {
      const getText = (...sels) => {
        for (const sel of sels) {
          try {
            const el = document.querySelector(sel);
            const text = el?.innerText?.trim() || el?.textContent?.trim() || '';
            if (text && text.length > 1) return text;
          } catch {}
        }
        return '';
      };

      // Назва — виключаємо короткі тексти (логотип тощо)
      let title = '';
      for (const el of document.querySelectorAll('h1')) {
        const text = el.innerText.trim();
        if (text.length > 3 && !text.includes('www.') && !text.includes('.com')) {
          title = text;
          break;
        }
      }
      if (!title) title = getText('[itemprop="name"]', '[class*="product-name"]', '[class*="product-title"]');

      // Ціна
      const priceAttr = document.querySelector('[itemprop="price"]')?.getAttribute('content');
      let price = parseFloat(priceAttr) || 0;
      if (!price) {
        const priceEl = document.querySelector([
          '[class*="price"]', '[class*="Price"]',
          '[class*="cost"]', '[class*="Cost"]',
        ].join(','));
        const priceRaw = priceEl?.innerText?.replace(/[^\d.,]/g, '').replace(',', '.') || '';
        price = parseFloat(priceRaw) || 0;
      }

      // Стара ціна
      const oldPriceRaw = getText('[class*="old"], [class*="crossed"], del, s');
      const oldPrice = parseFloat(oldPriceRaw.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;

      // Зображення — беремо усі img на сторінці де src виглядає як фото товару
      const images = [...new Set(
        [...document.querySelectorAll('img')]
          .map(img => img.dataset.src || img.dataset.lazySrc || img.dataset.original || img.getAttribute('src'))
          .filter(src => src && src.startsWith('http') && !src.includes('logo') &&
            !src.includes('icon') && !src.includes('sprite') && !src.includes('data:') &&
            (src.includes('.jpg') || src.includes('.jpeg') || src.includes('.png') || src.includes('.webp')))
      )];

      // Опис
      const description = getText(
        '[itemprop="description"]', '[class*="description"]',
        '[class*="detail-text"]', '[class*="product-text"]'
      );

      // Розміри
      const sizes = [...new Set(
        [...document.querySelectorAll('select option, [class*="size"] span, [class*="size"] label, [class*="rozmer"] span')]
          .map(el => (el.value || el.innerText).trim())
          .filter(v => /^(XXS|XS|S|M|L|XL|XXL|XXXL|3XL|4XL|\d{2,3})$/i.test(v))
      )];

      // Кольори
      const colors = [...new Set(
        [...document.querySelectorAll('select option, [class*="color"] span, [class*="color"] label, [class*="colour"] span')]
          .map(el => (el.value || el.innerText).trim())
          .filter(v => v.length > 1 && v.length < 30 && !v.toLowerCase().includes('обер') && !v.includes('--'))
      )];

      // Матеріал
      let material = '';
      document.querySelectorAll('tr, li, p').forEach(row => {
        const text = row.innerText?.toLowerCase() || '';
        if ((text.includes('матеріал') || text.includes('склад') || text.includes('тканин')) && text.length < 200) {
          material = row.innerText.trim();
        }
      });

      const category = (() => {
        const crumbs = [...document.querySelectorAll('[class*="breadcrumb"] a, [class*="bread"] a, nav a')];
        return crumbs.length > 0 ? crumbs[crumbs.length - 1].innerText.trim() : '';
      })();

      return { title, price, oldPrice, description, images, sizes, colors, material, category };
    });

    return { ...product, gender: genderHint || detectGender(product.category + ' ' + product.title), sourceUrl: url };
  } catch (err) {
    console.warn(`  Помилка: ${err.message}`);
    return null;
  }
}

function toDbFormat(p) {
  const sizes = p.sizes.length > 0 ? p.sizes : ['XS', 'S', 'M', 'L', 'XL'];
  const colors = p.colors.length > 0 ? p.colors : ['Чорний'];
  const variants = sizes.flatMap(size => colors.map(color => ({ size, color, quantity: 10 })));
  return {
    title: p.title,
    brand: 'Staff',
    price: p.price,
    salePrice: p.oldPrice > p.price && p.oldPrice > 0 ? p.price : undefined,
    isSale: p.oldPrice > p.price && p.oldPrice > 0,
    description: p.description || p.title,
    gender: p.gender,
    variants,
    material: p.material || '',
    images: p.images,
    sourceUrl: p.sourceUrl,
  };
}

async function main() {
  console.log('Запуск браузера...');
  const browser = await puppeteerExtra.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=uk-UA'],
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'uk-UA,uk;q=0.9' });
  await page.setViewport({ width: 1280, height: 900 });

  const allProducts = [];
  const visitedUrls = new Set();

  try {
    // 1. Збираємо посилання
    console.log(`Збираємо посилання з: ${CATEGORY_URL}\n`);
    const productLinks = await getProductLinks(page, CATEGORY_URL);
    console.log(`\nВсього: ${productLinks.length} товарів\n`);

    if (productLinks.length === 0) {
      console.log('Посилань не знайдено.');
      return;
    }

    // 2. Діагностика першого товару — зберігає HTML і виводить структуру
    await dumpProductHtml(page, productLinks[0]);
    console.log('\nПерегляньте diag.html та вивід вище.');
    console.log('Продовжити парсинг решти товарів? (продовжую автоматично через 5с...)\n');
    await sleep(5000);

    // 3. Парсимо всі товари
    const genderHint = detectGender(CATEGORY_URL);
    const limitedLinks = productLinks.slice(0, MAX_PRODUCTS);
    for (let i = 0; i < limitedLinks.length; i++) {
      const url = limitedLinks[i];
      if (visitedUrls.has(url)) continue;
      visitedUrls.add(url);

      const product = await parseProduct(page, url, genderHint);
      if (product && product.title && !product.title.includes('.com')) {
        allProducts.push(toDbFormat(product));
        console.log(`[${i + 1}/${limitedLinks.length}] ✓ "${product.title}" | ${product.price} грн | ${product.images.length} фото`);
      } else {
        console.log(`[${i + 1}/${limitedLinks.length}] ✗ ${url}`);
      }

      await sleep(DELAY);
    }
  } finally {
    await browser.close();
  }

  console.log(`\nЗаписуємо ${allProducts.length} товарів...`);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allProducts, null, 2), 'utf-8');
  console.log(`Готово! → ${OUTPUT_FILE}`);
}

main().catch(err => {
  console.error('Критична помилка:', err);
  process.exit(1);
});
