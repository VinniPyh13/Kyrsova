import Order from '../Models/Order.js';
import User from '../Models/User.js';
import BaseService from '../Services/BaseService.js';
import CartService from '../Services/CartService.js';

const orderService = new BaseService(Order);

class OrderController {
  // Створення нового замовлення
async createOrder(req, res) {
  try {
    const userId = req.user?.id;
    const { items, total, deliveryDate, city, warehouse, contact, paymentMethod, paypalPaymentId } = req.body;

    if (!items || !items.length || !total || !city || !warehouse || !deliveryDate || !contact || !paymentMethod) {
      return res.status(400).json({ message: "Обов'язкові поля відсутні" });
    }

    const newOrder = await orderService.create({
      user: userId,
      items,
      total,
      city,
      warehouse,
      deliveryDate,
      contact,
      paymentMethod,
      paypalPaymentId 
    });
    

    // 2. Додаємо замовлення до масиву замовлень користувача
    await User.findByIdAndUpdate(
      userId,
      { $push: { orders: newOrder._id } },
      { new: true }
    );

    // 3. Очищаємо кошик користувача
    await CartService.deleteCartByUser(userId);

    return res.status(201).json(newOrder);
  } catch (error) {
    console.error("Помилка при створенні замовлення:", error.message);
    return res.status(500).json({ message: "Помилка сервера" });
  }
}

  async getAllOrders(req, res) {
    try {
      const orders = await orderService.getAll();

      // Підтягуємо інформацію про книги і користувача
      await Order.populate(orders, [
        { path: 'items.book' },
        { path: 'user' }  // <-- вибираємо потрібні поля
      ]);

      return res.status(200).json(orders);
    } catch (error) {
      return res.status(500).json({ message: "Помилка отримання замовлень" });
    }
  }



  // Отримати замовлення по ID
async getOrderById(req, res) {
  try {
    const { id } = req.params;
    let order = await orderService.getOne(id);
    order = await Order.populate(order, { path: 'items.book' });
    return res.status(200).json(order);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
}


  // Оновлення замовлення (наприклад, зміна статусу)
async updateOrder(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate([
      { path: 'user', select: 'name surname email phone' },
      { path: 'items.book' }
    ]);

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Замовлення не знайдено' });
    }

    return res.status(200).json(updatedOrder);
  } catch (error) {
    return res.status(500).json({ message: 'Помилка при оновленні замовлення' });
  }
}


  // Видалення замовлення
// Видалення замовлення
    async deleteOrder(req, res) {
        try {
    const { id } = req.params;

    // Знайти замовлення перед видаленням, щоб отримати user ID
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Замовлення не знайдено" });
    }

    // Видаляємо замовлення
    const deletedOrder = await orderService.delete(id);

    // Видаляємо його з масиву замовлень користувача
    await User.findByIdAndUpdate(order.user, {
      $pull: { orders: id }
    });

    return res.status(200).json({ message: "Замовлення видалено", deletedOrder });
  } catch (error) {
    console.error("Помилка при видаленні замовлення:", error.message);
    return res.status(500).json({ message: "Помилка сервера" });
  }
}


  // Отримати всі замовлення користувача
  async getOrdersByUser(req, res) {
    try {
      const userId = req.user?.id;
      const orders = await Order.find({ user: userId }).populate('items.book');
      return res.status(200).json(orders);
    } catch (error) {
      return res.status(500).json({ message: "Помилка при отриманні замовлень користувача" });
    }
  }
}

export default new OrderController();
