import React from "react";
import { Link } from "react-router-dom";
import ProductCard from "../../Components/ProductCard"; 
import RecentlyViewed from "../../Components/RecentlyViewed/RecentlyViewed";
import "./HomePage.css";

// В App.js ми передаємо props: products (колишні books), setProducts та handleAddToCart
export const HomePage = ({ products: products, handleAddToCart, isProductFavorite, handleToggleFavorite }) => {
  // 1. Беремо перші 4 товари для знижок
  const discountProducts = products
    .filter((product) => product.isSale === true)
    .slice(0, 6);

  // 2. Отримуємо Новинки (сортуємо за датою додавання - від найновіших)
  const newArrivals = [...products]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  return (
    <div className="home-container">
      {/* 1. ГОЛОВНИЙ РЕКЛАМНИЙ БАНЕР */}
      <section className="hero-banner">
        <div className="hero-content">
          <h1>Весняна Колекція 2026</h1>
          <p>Онови свій стиль. Знижки на базовий гардероб до -40%</p>
          <Link to="/sale" className="hero-btn">
  Перейти до розпродажу
</Link>
        </div>
      </section>

      {/* 2. БАНЕРИ КАТЕГОРІЙ (ДЛЯ ХЛОПЦІВ ТА ДІВЧАТ) */}
      <section className="gender-banners">
        <Link to="/category/men" className="gender-card men">
          <div className="gender-card-content">
            <h2>Для хлопців</h2>
            <span className="gender-link">В каталог &rarr;</span>
          </div>
        </Link>

        <Link to="/category/women" className="gender-card women">
          <div className="gender-card-content">
            <h2>Для дівчат</h2>
            <span className="gender-link">В каталог &rarr;</span>
          </div>
        </Link>
      </section>

      {/* 3. БЛОК ЗІ ЗНИЖКАМИ */}
      <section className="product-section">
        <div className="section-header">
          <h2 className="section-title">🔥 Гарячі знижки</h2>
          <Link to="/sale" className="view-all">
            Дивитись всі
          </Link>
        </div>

        {/* Використовуємо ul.cards замість div.product-grid для сумісності з ProductCard.css */}
        {discountProducts.length > 0 ? (
          <ul className="cards" style={{ justifyContent: "flex-start" }}>
            {discountProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                handleAddToCart={handleAddToCart}
                isFavorite={isProductFavorite(product._id)} 
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </ul>
        ) : (
          <p className="no-products">Немає акційних товарів</p>
        )}
      </section>

      {/* 4. БЛОК З НОВИНКАМИ */}
      <section className="product-section">
        <div className="section-header">
          <h2 className="section-title">✨ Новинки</h2>
          <Link to="/new" className="view-all">
            Дивитись всі
          </Link>
        </div>

        {newArrivals.length > 0 ? (
          <ul className="cards" style={{ justifyContent: "flex-start" }}>
            {newArrivals.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                handleAddToCart={handleAddToCart}
                isFavorite={isProductFavorite(product._id)} 
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </ul>
        ) : (
          <p className="no-products">Незабаром з'являться нові товари!</p>
        )}
      </section>
<section className="product-section">
<RecentlyViewed 
          products={products} 
          isProductFavorite={isProductFavorite} 
          onToggleFavorite={handleToggleFavorite} 
          handleAddToCart={handleAddToCart}
        />
</section>
        

      
    </div>
  );
};