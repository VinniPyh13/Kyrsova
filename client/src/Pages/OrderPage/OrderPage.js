import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './OrderPage.css';

function OrderPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (!res.ok) throw new Error('Не вдалося завантажити замовлення');
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleBackClick = () => {
    navigate('/my_orders');
  };

  if (loading) return <div className="loading-container"><p>Завантаження...</p></div>;
  if (error) return <div className="error-container"><p>Помилка: {error}</p></div>;
  if (!order) return <div className="not-found"><p>Замовлення не знайдено</p></div>;

  const contact = order.contact || {};
  const { name, surname, phone, email } = contact;

  return (
    <div className="order-page-wrapper">
      <div className="order-page-card">
        <div className="order-header">
          <h1 className="order-title">Замовлення №{order._id.slice(-6).toUpperCase()}</h1>
          <div className={`order-status status-${order.status}`}>
            {order.status === 'processing' && 'В обробці'}
            {order.status === 'shipped' && 'Відправлено'}
            {order.status === 'delivered' && 'Доставлено'}
          </div>
        </div>

        <div className="order-info-grid">
          <div className="info-block">
            <h2 className="info-subtitle">Деталі замовлення</h2>
            <div className="info-row">
              <span className="info-label">Дата замовлення:</span>
              <span className="info-value">{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Загальна сума:</span>
              <span className="info-value total-price">{order.total} грн</span>
            </div>
            <div className="info-row">
              <span className="info-label">Доставка:</span>
              <span className="info-value">{order.warehouse}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Очікувана дата:</span>
              <span className="info-value">{new Date(order.deliveryDate).toLocaleDateString()}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Тип оплати:</span>
              <span className="info-value">
                {order.paymentMethod === 'cod' && 'При отриманні'}
                {order.paymentMethod === 'paypal' && 'PayPal'}
                {!['cod', 'paypal'].includes(order.paymentMethod) && 'Невідомо'}
              </span>
            </div>
          </div>

          <div className="info-block">
            <h2 className="info-subtitle">Контактні дані</h2>
            <div className="info-row">
              <span className="info-label">Одержувач:</span>
              <span className="info-value">{name || 'Невідомо'} {surname || ''}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Телефон:</span>
              <span className="info-value">{phone || 'Невідомо'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email:</span>
              <span className="info-value">{email || 'Невідомо'}</span>
            </div>
          </div>
        </div>

        <div className="order-items-section">
          <h2 className="info-subtitle">Товари у замовленні</h2>
          <ul className="items-list">
            {order.items.map((item, idx) => {
              // Підтримка як нового формату (product), так і старого (book)
              const productData = item.product || item.book;
              if (!productData) return null;

              return (
                <li key={item._id || idx} className="item-card">
                  <div className="item-image-wrapper">
                    <img 
                      src={productData.images?.[0] || '/placeholder.jpg'} 
                      alt={productData.title} 
                      className="item-image" 
                    />
                  </div>
                  <div className="item-details">
                    <h3 className="item-name">{productData.title}</h3>
                    
                    {/* Вивід розміру та кольору для одягу */}
                    {(item.selectedSize || item.selectedColor) && (
                      <div className="item-variants">
                        {item.selectedSize && <span className="variant-badge">Розмір: {item.selectedSize}</span>}
                        {item.selectedColor && <span className="variant-badge">Колір: {item.selectedColor}</span>}
                      </div>
                    )}
                    
                    <div className="item-price-calc">
                      <div className="calc-details">
                        <span className="item-qty">{item.quantity} шт.</span>
                        <span className="item-multiplier">×</span>
                        <span className="item-single-price">{item.priceSnapshot} грн</span>
                      </div>
                      <span className="item-total-price">{item.quantity * item.priceSnapshot} грн</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="order-actions">
          <button className="btn-back" onClick={handleBackClick}>
            ← Повернутися до списку
          </button>
        </div>
      </div>
    </div>
  );
}

export { OrderPage };