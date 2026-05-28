import React, { useState, useEffect, useMemo } from 'react';
import './CategoryBlock.css';

const CategoryBlock = ({ 
  selectedCategoryId, 
  selectedSubcategoryId, 
  onCategorySelect, 
  onSubcategorySelect,
  products = [],       // Отримуємо масив товарів
  currentGender = ""   // Отримуємо поточний гендер
}) => {
  const [categories, setCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [loading, setLoading] = useState(true);

  // Завантаження категорій з бекенду
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (!res.ok) throw new Error('Не вдалося завантажити категорії');
        const data = await res.json();
        setCategories(data);
        
        if (selectedCategoryId) {
          setExpandedCategories((prev) => ({ ...prev, [selectedCategoryId]: true }));
        }
      } catch (error) {
        console.error("Помилка завантаження категорій:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [selectedCategoryId]);

  // Розрахунок валідних підкатегорій на основі наявного одягу та гендеру
  const filteredCategories = useMemo(() => {
    if (categories.length === 0 || products.length === 0) return categories;

    const genderMapping = {
      "men": "Чоловічий",
      "women": "Жіночий"
    };
    const targetGender = genderMapping[currentGender];

    return categories.map(category => {
      if (!category.subcategories || category.subcategories.length === 0) return category;

      const validSubcategories = category.subcategories.filter(sub => {
        return products.some(product => {
          const subIds = product.subcategories ? product.subcategories.map(s => s._id || s) : [];
          const belongsToSubcategory = subIds.includes(sub._id);

          if (!belongsToSubcategory) return false;

          if (targetGender) {
            return product.gender === targetGender || product.gender === "Унісекс";
          }

          return true;
        });
      });

      return {
        ...category,
        subcategories: validSubcategories
      };
    });
  }, [categories, products, currentGender]);

  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // ОНОВЛЕНА ЛОГІКА КЛІКУ ПО ГОЛОВНІЙ КАТЕГОРІЇ
  const handleCategoryClick = (categoryId) => {
    // Якщо ця категорія вже обрана І при цьому НЕМАЄ активного підкаталогу — знімаємо фільтр повністю
    if (selectedCategoryId === categoryId && !selectedSubcategoryId) {
      onCategorySelect(null);
    } else {
      // Інакше — встановлюємо фільтр цієї категорії (а метод у CatalogPage сам підітре subcategory)
      onCategorySelect(categoryId);
      // Примусово розгортаємо гілку підкатегорій при виборі батьківського елемента
      setExpandedCategories((prev) => ({ ...prev, [categoryId]: true }));
    }
  };

  // ОНОВЛЕНА ЛОГІКА КЛІКУ ПО ПІДКАТЕГОРІЇ
  const handleSubcategoryClick = (e, categoryId, subcategoryId) => {
    e.stopPropagation(); // Запобігає виклику handleCategoryClick на батьківському блоці
    
    if (selectedSubcategoryId === subcategoryId) {
      // Якщо підкатегорія вже була обрана — скидаємо її, повертаючи користувача до перегляду ВСІЄЇ категорії
      onSubcategorySelect(null);
    } else {
      // Якщо ні — активуємо фільтрацію по підкатегорії
      onSubcategorySelect(subcategoryId);
    }
  };

  if (loading) {
    return <div className="category-block-loader">Завантаження категорій...</div>;
  }

  if (filteredCategories.length === 0) {
    return null;
  }

  return (
    <div className="category-block-wrapper">
      <h3 className="category-block-title">Категорії</h3>
      
      <ul className="category-list">
        {filteredCategories.map((category) => {
          const isExpanded = expandedCategories[category._id];
          const isCategorySelected = selectedCategoryId === category._id;
          
          // Категорія підсвічується як повністю активна тільки тоді, коли в URL є її ID, але немає підкатегорії
          const isFullCategorySelected = isCategorySelected && !selectedSubcategoryId;
          const hasSubcategories = category.subcategories && category.subcategories.length > 0;

          return (
            <li key={category._id} className="category-item">
              <div 
                className={`category-header ${isFullCategorySelected ? 'active' : ''} ${isCategorySelected ? 'parent-active' : ''}`}
                onClick={() => handleCategoryClick(category._id)} /* Тепер весь рядок реагує на клік та скидає підкатегорії */
              >
                <span className="category-name">
                  {category.name}
                </span>
                
                {hasSubcategories && (
                  <button 
                    className={`category-toggle-btn ${isExpanded ? 'rotated' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation(); // Щоб розгортання не скидало поточний фільтр товарів
                      toggleCategory(category._id);
                    }}
                  >
                    ▼
                  </button>
                )}
              </div>

              {/* ПІДКАТЕГОРІЇ */}
              {hasSubcategories && isExpanded && (
                <ul className="subcategory-list">
                  {category.subcategories.map((sub) => {
                    const isSubcategorySelected = selectedSubcategoryId === sub._id;
                    
                    return (
                      <li 
                        key={sub._id} 
                        className={`subcategory-item ${isSubcategorySelected ? 'active' : ''}`}
                        onClick={(e) => handleSubcategoryClick(e, category._id, sub._id)}
                      >
                        {sub.name}
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export { CategoryBlock };
export default CategoryBlock;