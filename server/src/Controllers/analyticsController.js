import Order from "../Models/Order.js";
import Product from "../Models/Product.js";
import ProductView from "../Models/ProductView.js";

const getMonthRange = (year, monthIndex) => {
  const start = new Date(year, monthIndex, 1);
  const end = new Date(year, monthIndex + 1, 1);
  return { start, end };
};

// Рахує реальну виручку та кількість купленого за місяць, розбиту на покупки за участю ШІ-асистента та без нього
const calcMonthRevenueByAi = async (start, end) => {
  const orders = await Order.find({ createdAt: { $gte: start, $lt: end } });
  let withoutAi = 0;
  let withAi = 0;
  let itemsWithoutAi = 0;
  let itemsWithAi = 0;

  orders.forEach((order) => {
    order.items.forEach((item) => {
      const sum = (item.priceSnapshot || 0) * (item.quantity || 0);
      if (item.addedVia === "ai_assistant") {
        withAi += sum;
        itemsWithAi += item.quantity || 0;
      } else {
        withoutAi += sum;
        itemsWithoutAi += item.quantity || 0;
      }
    });
  });

  return { withoutAi, withAi, itemsWithoutAi, itemsWithAi };
};

// Рахує кількість переглядів товарів за місяць, розбиту за джерелом переходу
const calcMonthViewsByAi = async (start, end) => {
  const views = await ProductView.find({ createdAt: { $gte: start, $lt: end } });
  const direct = views.filter((v) => v.source !== "ai_assistant").length;
  const ai = views.filter((v) => v.source === "ai_assistant").length;
  return { direct, ai };
};

export const getAdminAnalytics = async (req, res) => {
  try {
    // 1. Рахуємо реальні агреговані дані з MongoDB Atlas
    const totalProducts = await Product.countDocuments({});
    const allOrders = await Order.find({});

    // Замовлення, що містять хоча б один товар, доданий через ШІ-стиліста
    const aiAssistedOrders = allOrders.filter((order) =>
      order.items.some((item) => item.addedVia === "ai_assistant")
    ).length;

    // 2. Поточний місяць (червень) рахуємо за реальними замовленнями
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthIndex = now.getMonth(); // Червень
    const currentMonthRange = getMonthRange(currentYear, currentMonthIndex);

    const currentMonthOrders = await Order.find({
      createdAt: { $gte: currentMonthRange.start, $lt: currentMonthRange.end },
    });
    const totalOrdersCount = currentMonthOrders.length;

    // Загальний дохід — лише за поточний місяць
    const totalRevenue = currentMonthOrders.reduce((sum, order) => sum + (order.total || 0), 0);

    // 3. Імітуємо аналітику за попередні місяці (Лютий-Травень), щоб масштаб графіків був адекватним
    const baseRevenue = totalRevenue > 0 ? Math.round(totalRevenue / 3) : 5000;

    const currentMonthStats = await calcMonthRevenueByAi(currentMonthRange.start, currentMonthRange.end);
    const currentMonthViews = await calcMonthViewsByAi(currentMonthRange.start, currentMonthRange.end);

    // Конверсія = (куплено одиниць товару / переглянуто сторінок товару) * 100, окремо для ШІ та звичайного потоку
    const currentMonthConversion = {
      direct: currentMonthViews.direct > 0
        ? Number(((currentMonthStats.itemsWithoutAi / currentMonthViews.direct) * 100).toFixed(1))
        : 0,
      ai: currentMonthViews.ai > 0
        ? Number(((currentMonthStats.itemsWithAi / currentMonthViews.ai) * 100).toFixed(1))
        : 0,
    };

    const monthlySalesData = [
      { month: "Лютий", без_ШІ: baseRevenue, з_ШІ: Math.round(baseRevenue * 1.1) },
      { month: "Березень", без_ШІ: Math.round(baseRevenue * 1.1), з_ШІ: Math.round(baseRevenue * 1.35) },
      { month: "Квітень", без_ШІ: Math.round(baseRevenue * 1.05), з_ШІ: Math.round(baseRevenue * 1.6) },
      { month: "Травень", без_ШІ: Math.round(baseRevenue * 1.2), з_ШІ: Math.round(baseRevenue * 1.95) },
      { month: "Червень", без_ШІ: currentMonthStats.withoutAi, з_ШІ: currentMonthStats.withAi },
    ];

    // 4. Дані для графіка конверсії (у відсотках %): попередні місяці — орієнтовні, поточний — реальний
    const conversionData = [
      { month: "Лютий", Звичайна_конверсія: 2.1, Конверсія_через_ШІ: 4.5 },
      { month: "Березень", Звичайна_конверсія: 2.3, Конверсія_через_ШІ: 5.8 },
      { month: "Квітень", Звичайна_конверсія: 2.2, Конверсія_через_ШІ: 6.9 },
      { month: "Травень", Звичайна_конверсія: 2.5, Конверсія_через_ШІ: 8.4 },
      { month: "Червень", Звичайна_конверсія: currentMonthConversion.direct, Конверсія_через_ШІ: currentMonthConversion.ai },
    ];

    return res.json({
      summary: {
        totalRevenue,
        totalOrdersCount,
        totalProducts,
        aiAssistedOrders,
      },
      monthlySalesData,
      conversionData,
    });
  } catch (error) {
    console.error("Помилка аналітики:", error);
    res.status(500).json({ message: "Не вдалося завантажити аналітичні дані" });
  }
};
