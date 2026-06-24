import { GoogleGenerativeAI } from "@google/generative-ai";
import Product from "../Models/Product.js";
import Chat from "../Models/Chat.js";

const API_KEYS = [
  process.env.GEMINI_API_KEY
].filter(Boolean);

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
      const availableSizes = p.variants ? [...new Set(p.variants.map(v => v.size))] : [];
      const availableColors = p.variants ? [...new Set(p.variants.map(v => v.color))] : [];

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
        link: `/product/${p._id}`
      };
    });

    const systemPrompt = `Ти — персональний стиліст FashionStore. Наші товари: ${JSON.stringify(productContext)}. Відповідай українською. КОЛИ РАДИШ ТОВАР, ОБОВ'ЯЗКОВО ВСТАВЛЯЙ ПОСИЛАННЯ НА НЬОГО! Обов'язково звертай увагу на параметр "gender" товару: якщо клієнт просить жіночий одяг, пропонуй ТІЛЬКИ товари, де gender="Жіночий" або "Унісекс". Якщо просить чоловічий — ТІЛЬКИ "Чоловічий" або "Унісекс". Також не пропонуй товари з білизни, якщо тебе не попросять на пряму.`;

    const formattedHistory = chatSession.history.map(msg => ({
      role: msg.role,
      parts: msg.parts.map(part => ({ text: part.text }))
    }));

    // Try each API key; on 429 (quota) rotate to next key
    let responseText = null;

    for (const apiKey of API_KEYS) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

        const chat = model.startChat({
          history: [
            { role: "user", parts: [{ text: systemPrompt }] },
            { role: "model", parts: [{ text: "Привіт! Я ваш стиліст. Що підберемо сьогодні? 😊" }] },
            ...formattedHistory
          ],
        });

        // Retry on 503 (overload) up to 3 times
        let result;
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            result = await chat.sendMessage(message);
            break;
          } catch (err) {
            const is503 = err.status === 503 || (err.message && err.message.includes('503'));
            if (is503 && attempt < 3) {
              await new Promise(resolve => setTimeout(resolve, attempt * 2000));
            } else {
              throw err;
            }
          }
        }

        responseText = result.response.text();
        break;
      } catch (err) {
        const is429 = err.status === 429 || (err.message && err.message.includes('429'));
        if (is429) continue; // try next key
        throw err;
      }
    }

    if (responseText === null) {
      return res.status(429).json({ error: "Денний ліміт ШІ-запитів вичерпано. Спробуйте завтра або зверніться до адміністратора." });
    }

    chatSession.history.push({ role: "user", parts: [{ text: message }] });
    chatSession.history.push({ role: "model", parts: [{ text: responseText }] });
    await chatSession.save();

    res.json({ reply: responseText });
  } catch (error) {
    console.error(error);
    const is503 = error.status === 503 || (error.message && error.message.includes('503'));
    if (is503) {
      res.status(503).json({ error: "ШІ зараз перевантажений, спробуйте за кілька секунд" });
    } else {
      res.status(500).json({ error: "ШІ тимчасово недоступний" });
    }
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
