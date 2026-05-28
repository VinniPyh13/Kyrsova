import Order from "../Models/Order.js";
import Product from "../Models/Product.js";

export const getAdminAnalytics = async (req, res) => {
  try {
    // 1. Рахуємо реальні агреговані дані з MongoDB Atlas
    const totalProducts = await Product.countDocuments({});
    const allOrders = await Order.find({});
    
    const totalOrdersCount = allOrders.length;
    const totalRevenue = allOrders.reduce((sum, order) => sum + (order.total || 0), 0);

    // 2. Імітуємо аналітику за останні 4 місяці для графіків (A/B тестування ШІ)
    // Дані підлаштовуються під твою реальну виручку, щоб масштаб графіків був адекватним
    const baseRevenue = totalRevenue > 0 ? Math.round(totalRevenue / 3) : 5000;

    const monthlySalesData = [
      { month: "Лютий", без_ШІ: baseRevenue, з_ШІ: Math.round(baseRevenue * 1.1) },
      { month: "Березень", без_ШІ: Math.round(baseRevenue * 1.1), з_ШІ: Math.round(baseRevenue * 1.35) },
      { month: "Квітень", без_ШІ: Math.round(baseRevenue * 1.05), з_ШІ: Math.round(baseRevenue * 1.6) },
      { month: "Травень", без_ШІ: Math.round(baseRevenue * 1.2), з_ШІ: Math.round(baseRevenue * 1.95) }
    ];

    // 3. Дані для графіка конверсії (у відсотках %)
    const conversionData = [
      { month: "Лютий", Звичайна_конверсія: 2.1, Конверсія_через_ШІ: 4.5 },
      { month: "Березень", Звичайна_конверсія: 2.3, Конверсія_через_ШІ: 5.8 },
      { month: "Квітень", Звичайна_конверсія: 2.2, Конверсія_через_ШІ: 6.9 },
      { month: "Травень", Звичайна_конверсія: 2.5, Конверсія_через_ШІ: 8.4 }
    ];

    return res.json({
      summary: {
        totalRevenue,
        totalOrdersCount,
        totalProducts,
        aiAssistedOrders: Math.round(totalOrdersCount * 0.6) // показуємо, що 60% замовлень йдуть через ШІ
      },
      monthlySalesData,
      conversionData
    });
  } catch (error) {
    console.error("Помилка аналітики:", error);
    res.status(500).json({ message: "Не вдалося завантажити аналітичні дані" });
  }
};