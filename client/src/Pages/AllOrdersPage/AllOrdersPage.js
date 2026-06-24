import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthUser from "../../hooks/useAuthUser";
import "./AllOrdersPage.css";

function AllOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAllOrders = async () => {
      try {
        const res = await fetch("/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Не вдалося отримати замовлення");
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error("Помилка при завантаженні замовлень:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllOrders();
  }, [token]);

  const handleOrderClick = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Не вдалося оновити статус замовлення");

      const updatedOrder = await res.json();
      setOrders((prev) =>
        prev.map((order) => (order._id === orderId ? updatedOrder : order))
      );
    } catch (error) {
      console.error("Помилка при оновленні статусу:", error.message);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Ви впевнені, що хочете видалити це замовлення?"))
      return;

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Не вдалося видалити замовлення");

      setOrders((prev) => prev.filter((order) => order._id !== orderId));
    } catch (error) {
      console.error("Помилка при видаленні замовлення:", error.message);
    }
  };

  if (loading) return <div className="loading-container">Завантаження...</div>;

  return (
    <div className="page-wrapper">
      <div className="orders-container">
        
        {/* Додано обгортку для заголовка та кнопки назад */}
        <div className="admin-page-header">
          <button onClick={() => navigate('/admin')} className="btn-back-admin">
            ← Назад до адмін-панелі
          </button>
          <h1 className="orders-title">Управління замовленнями</h1>
        </div>
        
        <div className="orders-list-container">
          {orders.length === 0 ? (
            <p className="empty-orders">Замовлень немає</p>
          ) : (
            <ul className="orders-list">
              {orders.map((order) => {
                // Беремо контакти з order.contact (якщо є) або з order.user
                const contactName = order.contact?.name || order.user?.name || "Невідомо";
                const contactPhone = order.contact?.phone || order.user?.phone || "Невідомо";
                const contactEmail = order.contact?.email || order.user?.email || "Невідомо";

                return (
                  <li key={order._id} className="order-card">
                    <div className="order-header">
                      <h2
                        className="order-number"
                        onClick={() => handleOrderClick(order._id)}
                        title="Натисніть для перегляду деталей"
                      >
                        №{order._id.slice(-6).toUpperCase()}
                      </h2>
                      
                      <div className="admin-actions">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className={`order-status-select status-${order.status}`}
                        >
                          <option value="processing">В обробці</option>
                          <option value="shipped">Відправлено</option>
                          <option value="delivered">Доставлено</option>
                        </select>
                        <button
                          className="delete_btn"
                          onClick={() => handleDeleteOrder(order._id)}
                          title="Видалити замовлення"
                        >
                          Видалити
                        </button>
                      </div>
                    </div>

                    <div className="order-summary">
                      <div className="summary-col">
                        <div className="summary-item">
                          <span>Дата:</span>
                          <strong>{new Date(order.createdAt).toLocaleDateString()}</strong>
                        </div>
                        <div className="summary-item">
                          <span>Сума:</span>
                          <strong>{order.total} грн</strong>
                        </div>
                        <div className="summary-item">
                          <span>Доставка:</span>
                          <strong className="warehouse-text" title={order.warehouse}>{order.warehouse}</strong>
                        </div>
                        <div className="summary-item">
                          <span>Тип оплати:</span>
                          <strong>
                            {order.paymentMethod === 'paypal' ? 'Картою (сплачено)' : 'Післяплата при отриманні'}
                          </strong>
                        </div>
                      </div>

                      <div className="order-contact-section">
                        <h3 className="contact-title">Клієнт:</h3>
                        <div className="contact-details">
                          <div className="contact-row">
                            <span className="contact-label">👤</span>
                            <span className="contact-value">{contactName}</span>
                          </div>
                          <div className="contact-row">
                            <span className="contact-label">📞</span>
                            <span className="contact-value">{contactPhone}</span>
                          </div>
                          <div className="contact-row">
                            <span className="contact-label">✉️</span>
                            <span className="contact-value">{contactEmail}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="order-items-preview">
                      <h3 className="order-subtitle">Товари:</h3>
                      <ul className="order-items-list">
                        {order.items.map((item, idx) => {
                          const productData = item.product || item.book;
                          if (!productData) return null;

                          return (
                            <li key={item._id || idx} className="order-item">
                              <div className="order-item-image">
                                <img
                                  src={productData.images?.[0] || "/placeholder.jpg"}
                                  alt={productData.title}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/placeholder.jpg";
                                  }}
                                />
                              </div>
                              <div className="order-item-info">
                                <p className="order-item-title">
                                  {productData.title || "Товар видалено"}
                                </p>
                                
                                {(item.selectedSize || item.selectedColor) && (
                                  <p className="order-item-variant">
                                    {item.selectedSize && `Розмір: ${item.selectedSize} `}
                                    {item.selectedSize && item.selectedColor && `| `}
                                    {item.selectedColor && `Колір: ${item.selectedColor}`}
                                  </p>
                                )}
                                
                                <p className="order-item-details">
                                  {item.quantity} шт. × {item.priceSnapshot} грн
                                </p>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export { AllOrdersPage };