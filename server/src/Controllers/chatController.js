import { GoogleGenerativeAI } from "@google/generative-ai";
import Product from "../Models/Product.js";
import Chat from "../Models/Chat.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 1. Основна функція для спілкування
export const chatWithAI = async (req, res) => {
  const { message } = req.body;
  const userId = req.user._id; 

  try {
    let chatSession = await Chat.findOne({ user: userId });
    if (!chatSession) {
      chatSession = new Chat({ user: userId, history: [] });
    }

    const products = await Product.find({});
    const productContext = products.map(p => {
      // Збираємо всі унікальні розміри та кольори
      const availableSizes = p.variants ? [...new Set(p.variants.map(v => v.size))] : [];
      const availableColors = p.variants ? [...new Set(p.variants.map(v => v.color))] : [];

      // Формуємо ціну так, щоб ШІ чітко розумів, де є знижка
      let priceInfo = `${p.price} грн`;
      if (p.isSale && p.salePrice) {
        priceInfo = `${p.salePrice} грн (🔥 Акція! Звичайна ціна: ${p.price} грн)`;
      }

      return {
        name: p.title,
        gender: p.gender,
        price: priceInfo, 
        brand: p.brand,
        sizes: availableSizes.join(", "),
        colors: availableColors.join(", "),
        link: `http://localhost:3000/product/${p._id}`
      };
    });

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // ОНОВЛЕНО: жорстка інструкція щодо статі
    const systemPrompt = `Ти — персональний стиліст FashionStore. Наші товари: ${JSON.stringify(productContext)}. Відповідай українською. КОЛИ РАДИШ ТОВАР, ОБОВ'ЯЗКОВО ВСТАВЛЯЙ ПОСИЛАННЯ НА НЬОГО! Обов'язково звертай увагу на параметр "gender" товару: якщо клієнт просить жіночий одяг, пропонуй ТІЛЬКИ товари, де gender="Жіночий" або "Унісекс". Якщо просить чоловічий — ТІЛЬКИ "Чоловічий" або "Унісекс".`;

    const formattedHistory = chatSession.history.map(msg => ({
      role: msg.role,
      parts: msg.parts.map(part => ({ text: part.text }))
    }));

    // Передаємо очищену історію
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Привіт! Я ваш стиліст. Що підберемо сьогодні? 😊" }] },
        ...formattedHistory 
      ],
    });

    const result = await chat.sendMessage(message);
    const responseText = result.response.text();

    chatSession.history.push({ role: "user", parts: [{ text: message }] });
    chatSession.history.push({ role: "model", parts: [{ text: responseText }] });
    await chatSession.save();

    res.json({ reply: responseText });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "ШІ тимчасово недоступний" });
  }
};

// 2. Функція для отримання історії
export const getChatHistory = async (req, res) => {
  try {
    const chatSession = await Chat.findOne({ user: req.user._id });
    if (!chatSession) {
      return res.json({ history: [] });
    }
    res.json({ history: chatSession.history });
  } catch (error) {
    res.status(500).json({ error: "Помилка завантаження історії чату" });
  }
};