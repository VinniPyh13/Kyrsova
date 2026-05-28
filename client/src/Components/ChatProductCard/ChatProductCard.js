import React, { useState, useEffect } from 'react';
import API_URL from '../../apiUrl';
import { Link } from 'react-router-dom';
import './ChatProductCard.css'; // Використовуємо той самий файл стилів

const ChatProductCard = ({ productId }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Робимо запит до твого бекенду, щоб отримати дані конкретного товару
    // Переконайся, що цей роут (/api/products/:id) у тебе існує і працює!
    fetch(`${API_URL}/api/products/${productId}`)
      .then(res => res.json())
      .then(data => {
        // Якщо бекенд повертає об'єкт товару
        setProduct(data.product || data); 
        setLoading(false);
      })
      .catch(err => {
        console.error("Помилка завантаження товару для чату:", err);
        setLoading(false);
      });
  }, [productId]);

  if (loading) return <div className="chat-product-loading">⏳ Завантаження товару...</div>;
  if (!product) return <span className="chat-product-error">Товар не знайдено</span>;

  // Беремо перше фото з масиву (якщо воно є)
  const imageUrl = product.images && product.images.length > 0 
    ? product.images[0] 
    : 'https://via.placeholder.com/60x80?text=No+Image';

  return (
    <Link to={`/product/${product._id}`} className="chat-product-card">
      <img src={imageUrl} alt={product.title} className="chat-product-img" />
      <div className="chat-product-info">
        <h4>{product.title}</h4>
        <div className="chat-product-price-row">
          {product.isSale && product.salePrice ? (
            <>
              <span className="chat-price-new">{product.salePrice} грн</span>
              <span className="chat-price-old">{product.price} грн</span>
            </>
          ) : (
            <span className="chat-price-normal">{product.price} грн</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ChatProductCard;