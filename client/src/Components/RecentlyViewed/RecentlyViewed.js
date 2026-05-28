import React, { useState, useEffect, useRef } from 'react';
import ProductCard from '../ProductCard';
import './RecentlyViewed.css';

const RecentlyViewed = ({ products, isProductFavorite, onToggleFavorite, handleAddToCart }) => {
  const [viewedProducts, setViewedProducts] = useState([]);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const viewedIds = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    if (viewedIds.length > 0 && products && products.length > 0) {
      const foundProducts = viewedIds
        .map(id => products.find(p => p._id === id))
        .filter(Boolean)
        .slice(0, 6);
      setViewedProducts(foundProducts);
    }
  }, [products]);

  // Функція для прокрутки вліво/вправо
  const scroll = (direction) => {
    const { current } = scrollContainerRef;
    const scrollAmount = 300; // На скільки пікселів прокручувати
    if (direction === 'left') {
      current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (viewedProducts.length === 0) return null;

  return (
    <div className="recently-viewed-section">
      <div className="recently-viewed-header">
        <h3 className="section-title">Ви нещодавно дивилися</h3>
        
        {/* Кнопки керування каруселлю */}
        <div className="carousel-controls">
          <button className="carousel-btn prev" onClick={() => scroll('left')}>&#10094;</button>
          <button className="carousel-btn next" onClick={() => scroll('right')}>&#10095;</button>
        </div>
      </div>

      <div className="recently-viewed-container">
        <div className="recently-viewed-row" ref={scrollContainerRef}>
          {viewedProducts.map(product => (
            <div key={product._id} className="recently-viewed-item">
              <ProductCard 
    product={product} 
    isFavorite={isProductFavorite(product._id)} // ЗМІНИЛИ НАЗВУ І ДОДАЛИ ВИКЛИК (product._id)
    onToggleFavorite={onToggleFavorite} 
    handleAddToCart={handleAddToCart} 
/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentlyViewed;