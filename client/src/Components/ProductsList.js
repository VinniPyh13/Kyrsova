import React, { useState, useEffect } from "react";
import ProductCard from "./ProductCard"; // Оновлений імпорт
import "./ProductsList.css"; 

const ProductsList = ({
  products, // Змінено з books
  categories,
  subcategories,
  setSelectedProduct, // Змінено з setSelectedBook
  handleOpenModal,
  handleAddToCart,
  handleFavoriteChange,
}) => {
  const [filters, setFilters] = useState({
    category: "",
    subcategory: "",
    onlyFavorites: false,
    minPrice: "",
    maxPrice: "",
  });

  const [tempPrice, setTempPrice] = useState({
    minPrice: "",
    maxPrice: "",
  });

  const [sortOption, setSortOption] = useState("");
  const [priceFilterOpen, setPriceFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const togglePriceFilter = () => {
    setPriceFilterOpen((prev) => !prev);
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setTempPrice((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Фільтрування товарів
  const filteredProducts = products.filter((product) => {
    const inCategory =
      !filters.category ||
      (Array.isArray(product.categoryId) &&
        product.categoryId.some((cat) => String(cat._id) === filters.category));

    const inSubcategory =
      !filters.subcategory ||
      (Array.isArray(product.subcategories) &&
        product.subcategories.some(
          (sub) => String(sub._id) === filters.subcategory
        ));

    const isFavorite = !filters.onlyFavorites || product.favorite;

    // Враховуємо акційну ціну під час фільтрації, якщо вона є
    const actualPrice = product.isSale && product.salePrice ? product.salePrice : product.price;

    const isWithinPriceRange =
      (!filters.minPrice || actualPrice >= filters.minPrice) &&
      (!filters.maxPrice || actualPrice <= filters.maxPrice);

    return inCategory && inSubcategory && isFavorite && isWithinPriceRange;
  });

  const handleApplyPriceFilter = () => {
    setFilters((prev) => ({
      ...prev,
      minPrice: tempPrice.minPrice,
      maxPrice: tempPrice.maxPrice,
    }));
    togglePriceFilter();
  };

  const resetPriceFilter = () => {
    setFilters((prev) => ({ ...prev, minPrice: "", maxPrice: "" }));
    setTempPrice({ minPrice: "", maxPrice: "" });
    setPriceFilterOpen(false);
  };

  const sortProducts = (productsToSort) => {
    const sorted = [...productsToSort];
    switch (sortOption) {
      case "price-asc":
        return sorted.sort((a, b) => {
          const priceA = a.isSale && a.salePrice ? a.salePrice : a.price;
          const priceB = b.isSale && b.salePrice ? b.salePrice : b.price;
          return priceA - priceB;
        });
      case "price-desc":
        return sorted.sort((a, b) => {
          const priceA = a.isSale && a.salePrice ? a.salePrice : a.price;
          const priceB = b.isSale && b.salePrice ? b.salePrice : b.price;
          return priceB - priceA;
        });
      case "title-asc":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case "title-desc":
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      default:
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  };

  const finalProducts = sortProducts(filteredProducts);
  const visibleProducts = finalProducts.slice(0, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 12);
  };

  // Фільтруємо підкатегорії за вибраною категорією
  const filteredSubcategories = filters.category
    ? subcategories.filter((sub) => {
        if (typeof sub.categoryId === "object" && sub.categoryId !== null) {
          return String(sub.categoryId._id) === filters.category;
        }
        return String(sub.categoryId) === filters.category;
      })
    : subcategories;

  useEffect(() => {
    setVisibleCount(12);
  }, [filters, sortOption]);

  return (
    <section id="product-list">
      <div className="filters-container">
        <div className="filters-row">
          <div className="filter-group">
            <label className="filter-label">Категорія</label>
            <select
              className="filter-select"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
            >
              <option value="">Усі категорії</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Підкатегорія</label>
            <select
              className="filter-select"
              name="subcategory"
              value={filters.subcategory}
              onChange={handleFilterChange}
            >
              <option value="">Усі підкатегорії</option>
              {filteredSubcategories.map((subcategory) => (
                <option key={subcategory._id} value={subcategory._id}>
                  {subcategory.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Ціна</label>
            <button className="price-filter-button" onClick={togglePriceFilter}>
              Фільтр по ціні
              {(filters.minPrice || filters.maxPrice) && (
                <span className="price-filter-indicator"></span>
              )}
            </button>
          </div>

          <div className="filter-group">
            <label className="filter-label">Сортування</label>
            <select
              className="filter-select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="">Найновіші</option>
              <option value="price-asc">Ціна: Спочатку менша</option>
              <option value="price-desc">Ціна: Спочатку більша</option>
              <option value="title-asc">Назва: Від А до Я</option>
              <option value="title-desc">Назва: Від Я до А</option>
            </select>
          </div>
        </div>
      </div>

      {/* Price Filter Menu */}
      {priceFilterOpen && (
        <div className="price-filter-menu">
          <div className="price-filter-header">
            <h3>Фільтр по ціні</h3>
            <button className="close-button" onClick={() => setPriceFilterOpen(false)}>
              &times;
            </button>
          </div>
          <div className="price-inputs">
            <div className="price-input-group">
              <label>Від:</label>
              <input
                type="number"
                name="minPrice"
                value={tempPrice.minPrice}
                onChange={handlePriceChange}
                placeholder="Мін. ціна"
              />
            </div>
            <div className="price-input-group">
              <label>До:</label>
              <input
                type="number"
                name="maxPrice"
                value={tempPrice.maxPrice}
                onChange={handlePriceChange}
                placeholder="Макс. ціна"
              />
            </div>
          </div>
          <div className="price-filter-actions">
            <button className="apply-button" onClick={handleApplyPriceFilter}>Застосувати</button>
            <button className="reset-button" onClick={resetPriceFilter}>Скинути</button>
          </div>
        </div>
      )}

      <ul className="cards">
        {visibleProducts.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            onFavoriteChange={handleFavoriteChange}
            handleAddToCart={handleAddToCart}
          />
        ))}
      </ul>

      {visibleCount < finalProducts.length && (
        <div className="load-more-section">
          <button className="load-more-btn" onClick={handleLoadMore}>
            Дивитися далі
          </button>
        </div>
      )}
    </section>
  );
};

export default ProductsList;