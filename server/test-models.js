// test-models.js
const API_KEY = "AIzaSyB_Id50JtlkPa-jyQhQs87TujdyGbFoGTY"; // Встав свій ключ у лапки

async function checkModels() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
    const data = await response.json();
    
    if (data.error) {
      console.log("Помилка від Google:", data.error.message);
      return;
    }

    console.log("✅ Твоєму ключу доступні такі моделі Gemini:");
    // Фільтруємо, щоб показати тільки ті, що вміють генерувати контент
    const geminiModels = data.models.filter(m => m.name.includes('gemini') && m.supportedGenerationMethods.includes('generateContent'));
    
    geminiModels.forEach(m => console.log(`👉 ${m.name.replace('models/', '')}`));
    
  } catch (error) {
    console.error("Щось пішло не так:", error);
  }
}

checkModels();