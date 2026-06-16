import React from "react";
import { Link } from "react-router-dom";
import ProductCard from "../../Components/ProductCard"; 
import RecentlyViewed from "../../Components/RecentlyViewed/RecentlyViewed";
import "./HomePage.css";

// В App.js ми передаємо props: products (колишні books), setProducts та handleAddToCart
export const HomePage = ({ products: products, handleAddToCart, isProductFavorite, handleToggleFavorite }) => {
  const discountProducts = [...products]
    .filter((product) => product.isSale === true)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
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
          <h1>Літня Колекція 2026</h1>
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

      {/* 2.1. БАНЕР "ДЛЯ ВСІХ" НА ВСЮ ШИРИНУ */}
      <section className="all-banners">
        <Link
          to="/category/all"
          className="gender-card all"
          style={{
            backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.3)), url(${process.env.PUBLIC_URL}/DSC02135-velyke-jpeg.webp)`,
          }}
        >
          <div className="gender-card-content">
            <h2>Для всіх</h2>
            <span className="gender-link">В каталог &rarr;</span>
          </div>
        </Link>
      </section>

      {/* 3. БЛОК ЗІ ЗНИЖКАМИ */}
      <section className="product-section">
        <div className="section-header">
          <h2 className="section-title">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
            Гарячі знижки
          </h2>
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
          <h2 className="section-title">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
            Новинки
          </h2>
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