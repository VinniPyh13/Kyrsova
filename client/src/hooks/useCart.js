import { useState, useEffect } from "react";

const Alert = ({ message, type = "success", onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose && onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible) return null;

  const alertClasses = `custom-alert ${type}`;

  return (
    <div className={alertClasses}>
      <div className="alert-content">
        <span className="alert-message">{message}</span>
        <button
          className="alert-close"
          onClick={() => {
            setVisible(false);
            onClose && onClose();
          }}
        >
          &times;
        </button>
      </div>
    </div>
  );
};

const useCart = (token) => {
  const [cart, setCart] = useState({ items: [] });
  const [alerts, setAlerts] = useState([]);

  const addAlert = (message, type = "success") => {
    const id = Date.now();
    setAlerts((prev) => [...prev, { id, message, type }]);
    return id;
  };

  const removeAlert = (id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const fetchCart = async () => {
    if (!token) return;

    try {
      const res = await fetch("/api/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Не вдалося отримати кошик");
      const data = await res.json();
      setCart(data);
    } catch (err) {
      console.error("Помилка завантаження кошика:", err);
    }
  };

  const addToCart = async (bookID, quantity, price) => {
    try {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookID, quantity, price }),
      });

      if (!res.ok) throw new Error("Не вдалося додати книгу до кошика");

      addAlert("Книга успішно додана до кошика!", "success");
      await fetchCart(); // 🔄 оновлюємо кошик після додавання
    } catch (err) {
      console.error("Помилка додавання до кошика:", err);
    }
  };

  useEffect(() => {
    fetchCart(); // оновлення при зміні токена
  }, [token]);

  return {
    cart,
    addToCart,
    fetchCart,
  };
};

export default useCart;
