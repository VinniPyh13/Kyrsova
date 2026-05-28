import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthUser from '../../hooks/useAuthUser';
import './MyOrderPage.css';

function MyOrderPage() {
  const authUser = useAuthUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders/user', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Не вдалося отримати замовлення');
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error('Помилка при завантаженні замовлень:', err);
      } finally {
        setLoading(false);
      }
    };

    if (authUser) {
      fetchOrders();
    }
  }, [authUser, token]);

  const handleOrderClick = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  if (loading) {
    return <div className="loading-container"><p>Завантаження замовлень...</p></div>;
  }

  if (!orders.length) {
    return <div className="empty-orders"><p>У вас немає жодного замовлення.</p></div>;
  }

  return (
    <div className="page-wrapper">
      <div className="orders-container">
        <h1 className="orders-title">Мої замовлення</h1>
        
        <div className="orders-list-container">
          <ul className="orders-list">
            {orders.map((order) => (
              <li key={order._id} className="order-card" onClick={() => handleOrderClick(order._id)}>
                <div className="order-header">
                  <h2 className="order-number">Замовлення №{order._id.slice(-6).toUpperCase()}</h2>
                  <div className={`order-status status-${order.status}`}>
                    {order.status === 'processing' && 'В обробці'}
                    {order.status === 'shipped' && 'Відправлено'}
                    {order.status === 'delivered' && 'Доставлено'}
                  </div>
                </div>
                
                <div className="order-summary">
                  <div className="order-summary-item">
                    <span>Дата:</span>
                    <strong>{new Date(order.createdAt).toLocaleDateString()}</strong>
                  </div>
                  <div className="order-summary-item">
                    <span>Сума:</span>
                    <strong>{order.total} грн</strong>
                  </div>
                  <div className="order-summary-item">
                    <span>Доставка:</span>
                    <span className="warehouse-text">{order.warehouse}</span>
                  </div>
                </div>
                
                <div className="order-items-preview">
                  <h3 className="order-subtitle">Товари:</h3>
                  <ul className="order-items-list">
                    {order.items.map((item, idx) => {
                      // БЕЗПЕЧНА ПЕРЕВІРКА: пробуємо знайти дані в product або за старим ключем book
                      const productData = item.product || item.book;
                      
                      return (
                        <li key={idx} className="order-item">
                          <div className="order-item-image">
                            <img 
                              src={productData?.images?.[0] || '/placeholder.jpg'} 
                              alt={productData?.title || 'Товар'} 
                            />
                          </div>
                          <div className="order-item-info">
                            <h4 className="order-item-title">
                              {productData ? productData.title : "Товар більше недоступний"}
                            </h4>
                            <p className="order-item-variant">
                              {item.selectedSize && `Розмір: ${item.selectedSize}`}
                              {item.selectedColor && ` | Колір: ${item.selectedColor}`}
                            </p>
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
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export { MyOrderPage };