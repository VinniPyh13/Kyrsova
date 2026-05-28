import React, { useState } from 'react';
import './Filter.css';

const Filter = ({ 
  filters, 
  onFilterChange, 
  availableBrands = [], 
  availableSizes = [], 
  availableColors = [] 
}) => {
  // Локальний стан для згортання/розгортання блоку на мобільних пристроях
  const [isOpen, setIsOpen] = useState(false);

  // Обробник змін для текстових полів (ціна) та селекта (сортування)
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  // Обробник змін для чекбоксів (масиви значень)
  const handleCheckboxChange = (e, filterCategory) => {
    const { value, checked } = e.target;
    const currentValues = filters[filterCategory] || [];
    
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter((v) => v !== value);
      
    onFilterChange({ ...filters, [filterCategory]: newValues });
  };

  // Очищення всіх фільтрів
  const clearFilters = () => {
    onFilterChange({
      sort: 'newest',
      minPrice: '',
      maxPrice: '',
      brands: [],
      sizes: [],
      colors: []
    });
  };

  return (
    <div className="filter-wrapper">
      {/* Кнопка для мобільної версії */}
      <button className="filter-toggle-mobile" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? 'Сховати фільтри' : 'Показати фільтри'}
      </button>

      <div className={`filter-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="filter-header">
          <h3>Фільтри</h3>
          <button className="clear-btn" onClick={clearFilters}>Очистити</button>
        </div>

        {/* СОРТУВАННЯ */}
        <div className="filter-group">
          <label className="filter-label">Сортування</label>
          <select name="sort" value={filters.sort || 'newest'} onChange={handleChange} className="filter-select">
            <option value="newest">Новинки</option>
            <option value="popular">За популярністю</option> {/* НАША НОВА ОПЦІЯ */}
            <option value="sale_first">Спочатку з акціями</option>
            <option value="price_asc">Від дешевих до дорогих</option>
            <option value="price_desc">Від дорогих до дешевих</option>
            <option value="rating">За рейтингом</option>
          </select>
        </div>

        {/* ЦІНА */}
        <div className="filter-group">
          <label className="filter-label">Ціна (грн)</label>
          <div className="price-inputs">
            <input 
              type="number" 
              name="minPrice" 
              placeholder="Від" 
              value={filters.minPrice || ''} 
              onChange={handleChange} 
              min="0"
            />
            <span>-</span>
            <input 
              type="number" 
              name="maxPrice" 
              placeholder="До" 
              value={filters.maxPrice || ''} 
              onChange={handleChange} 
              min="0"
            />
          </div>
        </div>

        {/* РОЗМІРИ */}
        {availableSizes.length > 0 && (
          <div className="filter-group">
            <label className="filter-label">Розмір</label>
            <div className="checkbox-list">
              {availableSizes.map((size) => (
                <label key={size} className="checkbox-item">
                  <input 
                    type="checkbox" 
                    value={size} 
                    checked={(filters.sizes || []).includes(size)}
                    onChange={(e) => handleCheckboxChange(e, 'sizes')}
                  />
                  <span className="checkmark"></span>
                  {size}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* КОЛЬОРИ */}
        {availableColors.length > 0 && (
          <div className="filter-group">
            <label className="filter-label">Колір</label>
            <div className="checkbox-list">
              {availableColors.map((color) => (
                <label key={color} className="checkbox-item">
                  <input 
                    type="checkbox" 
                    value={color} 
                    checked={(filters.colors || []).includes(color)}
                    onChange={(e) => handleCheckboxChange(e, 'colors')}
                  />
                  <span className="checkmark"></span>
                  {color}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* БРЕНДИ */}
        {availableBrands.length > 0 && (
          <div className="filter-group">
            <label className="filter-label">Бренд</label>
            <div className="checkbox-list">
              {availableBrands.map((brand) => (
                <label key={brand} className="checkbox-item">
                  <input 
                    type="checkbox" 
                    value={brand} 
                    checked={(filters.brands || []).includes(brand)}
                    onChange={(e) => handleCheckboxChange(e, 'brands')}
                  />
                  <span className="checkmark"></span>
                  {brand || 'Інше'}
                </label>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Filter;