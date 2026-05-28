import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import StarRating from "../Components/StarRating/StarRating.js";
import "./ProductCard.css";

// Компонент Alert залишаємо без змін
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
  return (
    <div className={`custom-alert ${type}`}>
      <div className="alert-content">
        <span className="alert-message">{message}</span>
        <button className="alert-close" onClick={() => { setVisible(false); onClose && onClose(); }}>
          &times;
        </button>
      </div>
    </div>
  );
};

// ГОЛОВНІ ЗМІНИ ТУТ: Приймаємо пропси і використовуємо ТІЛЬКИ їх
const ProductCard = ({ product, isFavorite, onToggleFavorite }) => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);

  const addAlert = (message, type = "success") => {
    const id = Date.now();
    setAlerts((prev) => [...prev, { id, message, type }]);
    return id;
  };

  const removeAlert = (id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  // --- ЛОГІКА ДЛЯ ВАРІАЦІЙ ---
  const { totalQuantity, uniqueAvailableSizes } = useMemo(() => {
    if (!product.variants || !Array.isArray(product.variants)) {
      return { totalQuantity: 0, uniqueAvailableSizes: [] };
    }
    const available = product.variants.filter(v => v.quantity > 0);
    const totalQty = available.reduce((sum, v) => sum + v.quantity, 0);
    const sizes = [...new Set(available.map(v => v.size))];
    return { totalQuantity: totalQty, uniqueAvailableSizes: sizes };
  }, [product.variants]);

  const handleCardClick = () => {
    localStorage.setItem("lastViewedProduct", JSON.stringify(product));
    navigate(`/product/${product._id}`);
  };

  // Використовуємо функцію onToggleFavorite, яка прийшла з App.js
  const handleToggleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onToggleFavorite(product._id);
    // Ми не ставимо тут addAlert, бо App.js сам виводить сповіщення через свій AlertsContainer
  };

  const renderImageWithOverlay = () => {
    const imgSrc = product.images && product.images.length > 0 
      ? product.images[0] 
      : "https://via.placeholder.com/300x400";

    return (
      <div className="product-img-wrapper" onClick={handleCardClick}>
        <img src={imgSrc} alt={product.title || "Товар"} />
        
        {product.isSale && product.salePrice && totalQuantity > 0 && (
          <span className="card-discount-badge">
            -{Math.round(((product.price - product.salePrice) / product.price) * 100)}%
          </span>
        )}

        <button
          className={`favorite-btn-overlay ${isFavorite ? "is-favorite" : ""}`}
          onClick={handleToggleClick}
          title={isFavorite ? "Видалити з обраного" : "Додано в обране"}
        >
          {/* Використовуємо FaHeart якщо є іконки, або текст */}
          {isFavorite ? "♥" : "♡"}
        </button>
      </div>
    );
  };

  const renderRating = () => {
    if (product.averageRating) {
      return (
        <div className="rating">
          <StarRating rating={product.averageRating} />
        </div>
      );
    }
    return <div className="rating empty-rating">Немає оцінок</div>;
  };

  return (
    <li className="product-item">
      <div className="alerts-container">
        {alerts.map((alert) => (
          <Alert key={alert.id} message={alert.message} type={alert.type} onClose={() => removeAlert(alert.id)} />
        ))}
      </div>
      
      <article className="card">
        {renderImageWithOverlay()}
        
        <div className="product-list-info">
          <h3 onClick={handleCardClick}>{product.title}</h3>
          
          <div className="brand-and-sizes">
            <span className="product-brand">{product.brand || "Без бренду"}</span>
            
            {uniqueAvailableSizes.length > 0 && (
              <div className="product-sizes-mini">
                {uniqueAvailableSizes.slice(0, 4).map((size) => (
                  <span key={size} className="size-mini-badge">
                    {size}
                  </span>
                ))}
                {uniqueAvailableSizes.length > 4 && (
                  <span className="size-mini-badge">...</span>
                )}
              </div>
            )}
          </div>

          {renderRating()}
          
          <div className="card-price-block">
            {totalQuantity > 0 ? (
              product.isSale && product.salePrice ? (
                <>
                  <span className="price new-price">{product.salePrice} грн</span>
                  <span className="price old-price">{product.price} грн</span>
                </>
              ) : (
                <span className="price current-price">{product.price} грн</span>
              )
            ) : (
              <span className="out-of-stock-text">Немає в наявності</span>
            )}
          </div>
        </div>
      </article>
    </li>
  );
};

export default ProductCard;