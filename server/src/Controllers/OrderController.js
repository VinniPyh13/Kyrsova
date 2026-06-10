import Order from '../Models/Order.js';
import User from '../Models/User.js';
import Cart from '../Models/Cart.js'; // Додано для безпечного очищення кошика
import OrderService from '../Services/OrderService.js'; // Використовуємо правильний сервіс

class OrderController {
  
  // Створення нового замовлення
  async createOrder(req, res) {
    try {
      const userId = req.user?._id; // ВИПРАВЛЕНО: _id замість id
      const { items, total, deliveryDate, city, warehouse, contact, paymentMethod, paypalPaymentId } = req.body;

      const isItemsValid = items.every(item => item.selectedColor && item.selectedSize);
      if (!isItemsValid) {
            return res.status(400).json({ message: "Виберіть колір та розмір для всіх товарів" });
        }
        
      if (!items || !items.length || !total || !city || !warehouse || !deliveryDate || !contact || !paymentMethod) {
        return res.status(400).json({ message: "Обов'язкові поля відсутні" });
      }

      const newOrder = await OrderService.create({
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

      // Додаємо замовлення до масиву замовлень користувача
      await User.findByIdAndUpdate(
        userId,
        { $push: { orders: newOrder._id } },
        { new: true }
      );

      // ВИПРАВЛЕНО: Очищаємо кошик прямо через БД. 
      // Якщо використати CartService.deleteCartByUser, він поверне товари на склад, а нам це не потрібно при покупці!
      await Cart.findOneAndDelete({ user: userId });

      return res.status(201).json(newOrder);
    } catch (error) {
      console.error("Помилка при створенні замовлення:", error.message);
      return res.status(500).json({ message: "Помилка сервера" });
    }
  }

  // Отримати всі замовлення
  async getAllOrders(req, res) {
    try {
      const orders = await Order.find().sort({ createdAt: -1 });

      // Підтягуємо інформацію про товари і користувача
      await Order.populate(orders, [
        { path: 'items.product' }, // ВИПРАВЛЕНО: product замість book
        { path: 'user' }  
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
      let order = await OrderService.getOne(id);
      order = await Order.populate(order, { path: 'items.product' }); // ВИПРАВЛЕНО: product замість book
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
        { path: 'user', select: 'name email phone' }, // Прибрав surname, бо його немає в моделі User
        { path: 'items.product' } // ВИПРАВЛЕНО: product замість book
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
  async deleteOrder(req, res) {
    try {
      const { id } = req.params;

      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({ message: "Замовлення не знайдено" });
      }

      const deletedOrder = await OrderService.delete(id);

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
      const userId = req.user?._id; // ВИПРАВЛЕНО: _id замість id
      const orders = await Order.find({ user: userId }).populate('items.product'); // ВИПРАВЛЕНО: product замість book
      return res.status(200).json(orders);
    } catch (error) {
      return res.status(500).json({ message: "Помилка при отриманні замовлень користувача" });
    }
  }
}

export default new OrderController();