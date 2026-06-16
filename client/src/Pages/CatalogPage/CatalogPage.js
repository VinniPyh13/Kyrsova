import React, { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import ProductCard from "../../Components/ProductCard";
import Filter from "../../Components/Filter/Filter";
import RecentlyViewed from "../../Components/RecentlyViewed/RecentlyViewed";
import CategoryBlock from "../../Components/CategoryBlock/CategoryBlock";
import "./CatalogPage.css";

const CatalogPage = ({ products: allProducts, isProductFavorite, handleToggleFavorite, handleAddToCart }) => {
  const { type, gender } = useParams(); 
  const [searchParams, setSearchParams] = useSearchParams();

  const [filteredProducts, setFilteredProducts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(12);

  // 1. ЗЧИТУЄМО СТАНИ З URL
  const searchQuery = searchParams.get('search') || "";
  const selectedCategoryId = searchParams.get('category') || null;
  const selectedSubcategoryId = searchParams.get('subcategory') || null;
  
  const filters = useMemo(() => ({
    sort: searchParams.get('sort') || "newest",
    minPrice: searchParams.get('minPrice') || "",
    maxPrice: searchParams.get('maxPrice') || "",
    brands: searchParams.get('brands') ? searchParams.get('brands').split(',') : [],
    sizes: searchParams.get('sizes') ? searchParams.get('sizes').split(',') : [],
    colors: searchParams.get('colors') ? searchParams.get('colors').split(',') : []
  }), [searchParams]);

  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [window.location.pathname]); 

  // Оновлення параметрів фільтрації в URL
  const updateURLParams = (newFilters) => {
    const params = new URLSearchParams(searchParams);

    if (newFilters.sort && newFilters.sort !== 'newest') params.set('sort', newFilters.sort);
    else params.delete('sort');

    if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice);
    else params.delete('minPrice');

    if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice);
    else params.delete('maxPrice');

    if (newFilters.brands && newFilters.brands.length > 0) params.set('brands', newFilters.brands.join(','));
    else params.delete('brands');

    if (newFilters.sizes && newFilters.sizes.length > 0) params.set('sizes', newFilters.sizes.join(','));
    else params.delete('sizes');

    if (newFilters.colors && newFilters.colors.length > 0) params.set('colors', newFilters.colors.join(','));
    else params.delete('colors');

    setSearchParams(params);
  };

  // 2. ОНОВЛЕНА ЛОГІКА КЕРУВАННЯ КАТЕГОРІЯМИ ЧЕРЕЗ URL
  const handleCategorySelect = (id) => {
    const params = new URLSearchParams(searchParams);
    
    if (id) {
      params.set('category', id);
    } else {
      params.delete('category');
    }
    
    // ПРИМУСОВО ВИДАЛЯЄМО ПІДКАТЕГОРІЮ: щоб показати ВСІ товари цієї категорії
    params.delete('subcategory'); 
    setSearchParams(params);
  };

  const handleSubcategorySelect = (id) => {
    const params = new URLSearchParams(searchParams);
    if (id) {
      params.set('subcategory', id);
    } else {
      params.delete('subcategory');
    }
    setSearchParams(params);
  };

  const handleLocalSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearchQuery(value);
    const params = new URLSearchParams(searchParams);
    if (value) params.set('search', value);
    else params.delete('search');
    setSearchParams(params);
  };

  const pageInfo = useMemo(() => {
    if (window.location.pathname.includes("/sale")) return { title: "Розпродаж та Акції", type: "sale", banner: "sale-banner" };
    if (window.location.pathname.includes("/new")) return { title: "Нові надходження", type: "new", banner: "new-banner" };
    if (gender === "men") return { title: "Чоловічий одяг", type: "men", banner: "men-banner" };
    if (gender === "women") return { title: "Жіночий одяг", type: "women", banner: "women-banner" };
    if (gender === "all") return { title: "Одяг для всіх", type: "all", banner: "all-banner" };
    return { title: "Каталог товарів", type: "all", banner: null };
  }, [gender, window.location.pathname]);

  const filterOptions = useMemo(() => {
    const brands = [...new Set(allProducts.map(p => p.brand))].filter(Boolean);
    const sizes = [...new Set(allProducts.flatMap(p => p.variants.map(v => v.size)))].filter(Boolean);
    const colors = [...new Set(allProducts.flatMap(p => p.variants.map(v => v.color)))].filter(Boolean);
    return { brands, sizes, colors };
  }, [allProducts]);

  // ЛОГІКА ФІЛЬТРАЦІЇ ТА СОРТУВАННЯ
  useEffect(() => {
    let result = [...allProducts];

    if (localSearchQuery) {
      const lowerQuery = localSearchQuery.toLowerCase().trim();
      result = result.filter(p => 
        p.title.toLowerCase().includes(lowerQuery) ||
        (p.brand && p.brand.toLowerCase().includes(lowerQuery)) ||
        (p.description && p.description.toLowerCase().includes(lowerQuery))
      );
    }

    if (pageInfo.type === "sale") result = result.filter(p => p.isSale);
    if (pageInfo.type === "men") result = result.filter(p => p.gender === "Чоловічий" || p.gender === "Унісекс");
    if (pageInfo.type === "women") result = result.filter(p => p.gender === "Жіночий" || p.gender === "Унісекс");

    if (selectedCategoryId) {
        result = result.filter(p => {
            const catIds = Array.isArray(p.categoryId) ? p.categoryId.map(c => c._id || c) : [p.categoryId?._id || p.categoryId];
            return catIds.includes(selectedCategoryId);
        });
    }
    if (selectedSubcategoryId) {
        result = result.filter(p => {
            const subIds = p.subcategories ? p.subcategories.map(s => s._id || s) : [];
            return subIds.includes(selectedSubcategoryId);
        });
    }

    if (filters.minPrice) result = result.filter(p => (p.salePrice || p.price) >= Number(filters.minPrice));
    if (filters.maxPrice) result = result.filter(p => (p.salePrice || p.price) <= Number(filters.maxPrice));
    if (filters.brands.length > 0) result = result.filter(p => filters.brands.includes(p.brand));
    if (filters.sizes.length > 0) {
        result = result.filter(p => p.variants.some(v => filters.sizes.includes(v.size) && v.quantity > 0));
    }
    if (filters.colors.length > 0) {
        result = result.filter(p => p.variants.some(v => filters.colors.includes(v.color) && v.quantity > 0));
    }

    if (filters.sort === "price_asc") {
      result.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
    } else if (filters.sort === "price_desc") {
      result.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
    } else if (filters.sort === "popular") {
      result.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
    } else if (filters.sort === "sale_first") {
      result.sort((a, b) => {
        const isSaleA = a.isSale ? 1 : 0;
        const isSaleB = b.isSale ? 1 : 0;
        if (isSaleB !== isSaleA) return isSaleB - isSaleA; 
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    } else {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredProducts(result);
    setVisibleCount(12);
  }, [allProducts, pageInfo, selectedCategoryId, selectedSubcategoryId, filters, localSearchQuery]);

  return (
    <div className="catalog-container">
      <aside className="catalog-sidebar">
        <CategoryBlock 
          selectedCategoryId={selectedCategoryId}
          selectedSubcategoryId={selectedSubcategoryId}
          onCategorySelect={handleCategorySelect} 
          onSubcategorySelect={handleSubcategorySelect}
          products={allProducts}
          currentGender={gender}
        />
        <Filter 
          filters={filters} 
          onFilterChange={updateURLParams} 
          availableBrands={filterOptions.brands}
          availableSizes={filterOptions.sizes}
          availableColors={filterOptions.colors}
        />
      </aside>

      <main className="catalog-main">
        {pageInfo.banner && (
          <div
            className={`catalog-banner ${pageInfo.banner}`}
            style={
              pageInfo.banner === "all-banner"
                ? { backgroundImage: `url(${process.env.PUBLIC_URL}/DSC02135-velyke-jpeg.webp)` }
                : undefined
            }
          >
            <div className="banner-overlay">
              <h1>{pageInfo.title}</h1>
              <p>Відкрийте для себе найкращі пропозиції сезону</p>
            </div>
          </div>
        )}

        {!pageInfo.banner && <h1 className="page-title">{pageInfo.title}</h1>}

        <div className="catalog-search-wrapper">
          <input
            type="text"
            className="catalog-search-input"
            placeholder="Пошук одягу за назвою, брендом або описом..."
            value={localSearchQuery}
            onChange={handleLocalSearchChange}
          />
          {localSearchQuery && (
            <button className="catalog-search-clear-btn" onClick={() => handleLocalSearchChange({ target: { value: "" } })} />
          )}
        </div>

        <div className="catalog-results-info">
          Знайдено товарів: {filteredProducts.length}
        </div>

        {filteredProducts.length > 0 ? (
          <>
            <div className="catalog-grid">
              {filteredProducts.slice(0, visibleCount).map(product => (
                <ProductCard 
                  key={product._id} 
                  product={product} 
                  isFavorite={isProductFavorite(product._id)} 
                  onToggleFavorite={handleToggleFavorite} 
                  handleAddToCart={handleAddToCart} 
                />
              ))}
            </div>

            {visibleCount < filteredProducts.length && (
              <div className="load-more-container">
                <button className="load-more-btn" onClick={() => setVisibleCount(prev => prev + 12)}>
                  Дивитися далі
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="no-results">
            <h3>Нічого не знайдено</h3>
            <p>Спробуйте змінити параметри фільтрації, ключове слово або обрану категорію.</p>
          </div>
        )}
        
        <div className="catalog-main1">
            <RecentlyViewed 
              products={allProducts} 
              isProductFavorite={isProductFavorite} 
              onToggleFavorite={handleToggleFavorite} 
              handleAddToCart={handleAddToCart}
            />
        </div>
      </main>
    </div>
  );
};

export { CatalogPage };