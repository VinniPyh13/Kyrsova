import React, { useState, useEffect, useCallback } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import { RiAccountCircleLine } from "react-icons/ri";

import { HomePage } from "./Pages/HomePage/HomePage";
import { LoginPage } from "./Pages/LoginPage/LoginPage";
import { MyAccountPage } from "./Pages/MyAccountPage/MyAccountPage";
import { AdminPage } from "./Pages/AdminPage/AdminPage";
import { AddProductPage } from "./Pages/AddProductPage/AddProductPage";
import { EditProductPage } from "./Pages/EditProductPage/EditProductPage";
import { ProductPage} from "./Pages/ProductPage/ProductPage";
import { CategoriesPage } from "./Pages/CategoriesPage/CategoriesPage";
import { AllOrdersPage } from "./Pages/AllOrdersPage/AllOrdersPage";
import { NewOrderPage } from "./Pages/NewOrderPage/NewOrderpage";
import { MyOrderPage } from "./Pages/MyOrderPage/MyOrderPage";
import { OrderPage } from "./Pages/OrderPage/OrderPage";
import { NotFoundPage } from "./Pages/NotFoundPage";
import RegisterPage from "./Pages/RegisterPage/RegisterPage";
import useAuthUser from "../src/hooks/useAuthUser";
import { AdminRoute } from "./Components/AdminRoute/AdminRoute";
import { CatalogPage } from "./Pages/CatalogPage/CatalogPage";
import SearchPopup from "./Components/SearchPopup/SearchPopup";
import ChatPage from './Pages/ChatPage/ChatPage';
import { AnalyticsPage } from "./Pages/AnalyticsPage/AnalyticsPage";
import { AboutUsPage } from "./Pages/AboutUs/AboutUsPage";

import "./App.css";

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

function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [cartMenuOpen, setCartMenuOpen] = useState(false);
  const [isSearchPopupOpen, setIsSearchPopupOpen] = useState(false);
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  
  const [cart, setCart] = useState({ items: [] });
  const [alerts, setAlerts] = useState([]);
  const user = useAuthUser();
  const token = localStorage.getItem("token");

  const navigate = useNavigate();

  const toggleNavbar = () => setNavbarOpen(!navbarOpen);
  const toggleAccountMenu = () => setAccountMenuOpen(!accountMenuOpen);
  const toggleCartMenu = () => setCartMenuOpen(!cartMenuOpen);

  const authUser = useAuthUser(); // Дані з твого хука
  const [currentUser, setCurrentUser] = useState(null); // Локальний стан для миттєвих оновлень

  // Синхронізуємо локальний стан з хуком, коли він завантажиться
  useEffect(() => {
    if (authUser) {
      setCurrentUser(authUser);
    }
  }, [authUser]);

  // Оновлюємо функцію перевірки (використовуємо currentUser)
  const isProductFavorite = (productId) => {
    return currentUser && 
           Array.isArray(currentUser.fav_products) && 
           currentUser.fav_products.includes(productId);
  };

  const addAlert = (message, type = "success") => {
    const id = Date.now();
    setAlerts((prev) => [...prev, { id, message, type }]);
    return id;
  };

  const removeAlert = (id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const closeAllMenus = () => {
    setNavbarOpen(false);
    setAccountMenuOpen(false);
    setCartMenuOpen(false);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim() === "") {
      setFilteredProducts(products);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = products.filter(
        (product) =>
          product.title.toLowerCase().includes(lowerQuery) ||
          (product.brand && product.brand.toLowerCase().includes(lowerQuery))
      );
      setFilteredProducts(filtered);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    closeAllMenus();
    window.location.href = '/login';
  };

  const getCartItemCount = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products"); 
        if (!res.ok) throw new Error("Не вдалося завантажити товари");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Помилка завантаження товарів:", err);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = async (productID, quantity = 1, price, selectedSize = "M", selectedColor = "Чорний") => {
    try {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productID, quantity, price, selectedSize, selectedColor }),
      });

      if (!res.ok) throw new Error("Не вдалося додати товар до кошика");
      const updatedCart = await res.json();
      setCart(updatedCart);
      addAlert("Товар успішно додано до кошика!", "success");
    } catch (err) {
      console.error("Помилка додавання до кошика:", err);
      alert("Помилка додавання товару до кошика");
    }
  };

  const handleRemoveFromCart = async (productID, selectedSize, selectedColor, quantity = 1) => {
    try {
      const res = await fetch("/api/cart/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productID, selectedSize, selectedColor, quantity }),
      });

      if (!res.ok) throw new Error("Не вдалося видалити товар з кошика");
      const updatedCart = await res.json();
      setCart(updatedCart);
    } catch (err) {
      console.error("Помилка видалення з кошика:", err);
    }
  };

  // ФУНКЦІЯ ОТРИМАННЯ КОШИКА
  const fetchCart = useCallback(async () => {
    const currentToken = localStorage.getItem("token");
    if (!currentToken) return;

    try {
      const res = await fetch("/api/cart", {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });
      if (!res.ok) throw new Error("Не вдалося отримати кошик");
      const data = await res.json();
      setCart(data);
    } catch (err) {
      console.error("Помилка завантаження кошика:", err);
    }
  }, []);

// Функція для перемикання статусу (додати/видалити)
const handleToggleFavorite = async (productId) => {
  if (!currentUser) {
    addAlert("Потрібно увійти для додавання в обране", "error");
    return;
  }

  const isFav = isProductFavorite(productId);
  const url = `/api/users/favorites/${isFav ? "remove" : "add"}`;
  const method = isFav ? "DELETE" : "POST";

  try {
    const res = await fetch(url, {
      method,
      headers: { 
        "Content-Type": "application/json", 
        Authorization: `Bearer ${localStorage.getItem("token")}` 
      },
      body: JSON.stringify({ userId: currentUser._id, productId }),
    });

    if (res.ok) {
      // Створюємо НОВУ копію об'єкта користувача
      const updatedUser = { ...currentUser };
      
      if (isFav) {
        updatedUser.fav_products = updatedUser.fav_products.filter(id => id !== productId);
      } else {
        updatedUser.fav_products = [...(updatedUser.fav_products || []), productId];
      }
      
      // ОНОВЛЮЄМО СТАН (React побачить новий об'єкт і оновить інтерфейс)
      setCurrentUser(updatedUser);
      
      addAlert(isFav ? "Видалено з обраного" : "Додано в обране", "success");
      // window.location.reload(); // ЦЕЙ РЯДОК БІЛЬШЕ НЕ ПОТРІБЕН
    }
  } catch (e) {
    console.error("Помилка з обраним:", e);
  }
};

  // ГОЛОВНИЙ ФІКС НЕСКІНЧЕННОГО ЦИКЛУ:
  // Залежимо ТІЛЬКИ від token або user._id, щоб не викликати fetchCart при кожній зміні об'єкта user
  useEffect(() => {
    if (token) {
      fetchCart();
    }
  }, [token, fetchCart]);

  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  return (
    <>
      {/* ВИПРАВЛЕНО: app-wrapper тепер обгортає весь сайт і є прямим нащадком body/#root */}
      <div className="app-wrapper">
        
        <div className="alerts-container">
          {alerts.map((alert) => (
            <Alert key={alert.id} message={alert.message} type={alert.type} onClose={() => removeAlert(alert.id)} />
          ))}
        </div>

        <SearchPopup 
          isOpen={isSearchPopupOpen} 
          onClose={() => setIsSearchPopupOpen(false)} 
        />

        {(navbarOpen || accountMenuOpen || cartMenuOpen) && (
          <div className="overlay" onClick={closeAllMenus}></div>
        )}

        <header className={`navbar ${navbarOpen ? "open" : ""}`}>
          <div className="top-row">
            <div className="left-side">
              <button className="burger-btn" onClick={toggleNavbar} aria-label="Toggle navigation menu">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="burger-icon">
                  <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              <a href="/" className="logo">
                <img src="/logo.jpg" alt="Logo" className="logo-image" />
                <span className="logo-text">FashionStore</span>
              </a>
            </div>

            <div className="header-controls">
              <div className="search-container">
                <button 
                  className="search-icon-btn" 
                  onClick={() => setIsSearchPopupOpen(true)} 
                  aria-label="Open search popup"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#111', display: 'flex' }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="search-icon">
                    <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              <div className="ai-stylist-container" style={{ display: 'flex', alignItems: 'center', marginLeft: '15px', marginRight: '15px' }}>
                <Link 
                  to="/stylist" 
                  aria-label="ШІ-Стиліст"
                  title="ШІ-Стиліст"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#111', display: 'flex', textDecoration: 'none', transition: 'transform 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ai-icon">
                    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
                    <path d="M20 3v4"/>
                    <path d="M22 5h-4"/>
                    <path d="M4 17v2"/>
                    <path d="M5 18H3"/>
                  </svg>
                </Link>
              </div>

              <div className="user-actions">
                <div className="cart-wrapper" onClick={toggleCartMenu}>
                  <FaShoppingCart className="cart-icon" />
                  {getCartItemCount() > 0 && (
                    <span className="cart-badge">{getCartItemCount()}</span>
                  )}
                </div>
                <button className="account-btn" onClick={toggleAccountMenu} aria-label="Account menu">
                  <RiAccountCircleLine className="account-icon" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="top-row">
            <nav>
              <ul className="nav-links">
                <li><Link to="/">Головна</Link></li>
                <li><Link to="/new" className="nav-new-link">Новинки</Link></li>
                <li><Link to="/sale" className="nav-sale-link">Знижка %</Link></li>
                <li><Link to="/category/men">Чоловічий</Link></li>
                <li><Link to="/category/women">Жіночий</Link></li>
                <li><Link to="/category/all">Для всіх</Link></li>
                <li><Link to="/about">Про нас</Link></li>
              </ul>
            </nav>
          </div>
        </header>

        {/* Бічні менюшки залишаються всередині структури додатка */}
        <div className={`cart-menu ${cartMenuOpen ? "open" : ""}`}>
          <h1>Кошик</h1>
          {!cart || !Array.isArray(cart.items) ? (
            <p>Завантаження...</p>
          ) : cart.items.length > 0 ? (
            <ul>
              {cart.items.map((item) => (
                <li key={`${item.product._id}-${item.selectedSize}-${item.selectedColor}`} className="cart-item">
                  {item.product.images && item.product.images.length > 0 && (
                    <div className="cart-item__image">
                      <a href={`/product/${item.product._id}`}>
                        <img src={item.product.images[0]} alt={item.product.title} className="cart-item__img" />
                      </a>
                    </div>
                  )}
                  <div className="cart-item__info">
                    <a href={`/product/${item.product._id}`} className="cart-item__title">
                      <h3>{item.product.title}</h3>
                    </a>
                    <p className="cart-item__variant">
                      Розмір: <strong>{item.selectedSize}</strong> | Колір: <strong>{item.selectedColor}</strong>
                    </p>
                    <p>{item.quantity} шт. × {item.priceSnapshot} грн</p>
                    <div className="cart-item__actions">
                      <button className="cart-item__action-btn" onClick={() => handleAddToCart(item.product._id, 1, item.priceSnapshot, item.selectedSize, item.selectedColor)}>+</button>
                      <button className="cart-item__action-btn" onClick={() => handleRemoveFromCart(item.product._id, item.selectedSize, item.selectedColor, 1)}>-</button>
                    </div>
                  </div>
                </li>
              ))}
              <li className="cart-total"><strong>Загальна сума: {cart.total} грн</strong></li>
              <li>
                <button className="checkout-button" onClick={() => { navigate("/new_order"); closeAllMenus(); }}>
                  Оформити замовлення
                </button>
              </li>
            </ul>
          ) : (
            <p>Кошик порожній</p>
          )}
        </div>

        <div className={`account-menu ${accountMenuOpen ? "open" : ""}`}>
          <button className="account-menu-close-btn" onClick={closeAllMenus} aria-label="Close account menu">&times;</button>
          <ul>
            <h1>Профіль</h1>
            {user ? (
              <>
                <li><Link to="/my_acc" className="menu__link" onClick={closeAllMenus}>Мій профіль</Link></li>
                <li><Link to="/my_orders" className="menu__link" onClick={closeAllMenus}>Мої замовлення</Link></li>
                {user?.roles?.includes("ADMIN") && (
                  <li><Link to="/admin" className="menu__link" onClick={closeAllMenus}>Панель адміністратора</Link></li>
                )}
                <li><button className="search_button logout_style" onClick={handleLogout}>Вийти з облікового запису</button></li>
              </>
            ) : (
              <>
                <li><Link to="/login" className="menu__link" onClick={closeAllMenus}>Увійти</Link></li>
                <li><Link to="/registration" className="menu__link" onClick={closeAllMenus}>Реєстрація</Link></li>
              </>
            )}
          </ul>
        </div>

        <div className={`menu ${navbarOpen ? "open" : ""}`}>
          <button className="menu-close-btn" onClick={closeAllMenus} aria-label="Close menu">&times;</button>
          <ul className="menu__list">
            <h1>Каталог</h1>
            <li><Link to="/" className="menu__link" onClick={closeAllMenus}>Головна</Link></li>
            <li><Link to="/new" className="menu__link nav-new-link" onClick={closeAllMenus}>Новинки</Link></li>
            <li><Link to="/category/men" className="menu__link" onClick={closeAllMenus}>Чоловічий одяг</Link></li>
            <li><Link to="/category/women" className="menu__link" onClick={closeAllMenus}>Жіночий одяг</Link></li>
            <li><Link to="/category/all" className="menu__link" onClick={closeAllMenus}>Для всіх</Link></li>
            <li><Link to="/sale" className="menu__link nav-sale-link" onClick={closeAllMenus}>Знижка %</Link></li>
            <li><Link to="/about" className="menu__link" onClick={closeAllMenus}>Про нас</Link></li>
          </ul>
        </div>

        {/* ВИПРАВЛЕНО: Загортаємо роути в семантичний тег <main> із потрібним флекс-класом */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage products={products} handleAddToCart={handleAddToCart} isProductFavorite={isProductFavorite} handleToggleFavorite={handleToggleFavorite} />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/my_acc" element={<MyAccountPage />} />
            <Route path="/my_orders" element={<MyOrderPage />} />
            <Route path="/orders/:orderId" element={<OrderPage />} />
            <Route path="*" element={<NotFoundPage />} />
            <Route path="/product/:id" element={<ProductPage products={products} fetchCart={fetchCart} isProductFavorite={isProductFavorite} handleToggleFavorite={handleToggleFavorite} />} />
            <Route path="/new_order" element={<NewOrderPage />} />
            <Route path="/stylist" element={<ChatPage />} />
            <Route path="/registration" element={<RegisterPage />} />
            <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
            <Route path="/admin/edit_product/:id" element={<AdminRoute><EditProductPage /></AdminRoute>} />
            <Route path="/admin/add_product" element={<AdminRoute><AddProductPage /></AdminRoute>} />
            <Route path="/admin/all_orders" element={<AdminRoute><AllOrdersPage /></AdminRoute>} />
            <Route path="/admin/categories" element={<AdminRoute><CategoriesPage /></AdminRoute>} />
            <Route path="/admin/analytics" element={<AdminRoute><AnalyticsPage /></AdminRoute>} />
            <Route path="/new" element={<CatalogPage products={products} isProductFavorite={isProductFavorite} handleToggleFavorite={handleToggleFavorite} />} />
            <Route path="/sale" element={<CatalogPage products={products} isProductFavorite={isProductFavorite} handleToggleFavorite={handleToggleFavorite} />} />
            <Route path="/category/:gender" element={<CatalogPage products={products} isProductFavorite={isProductFavorite} handleToggleFavorite={handleToggleFavorite} />} />
            <Route path="/about" element={<AboutUsPage />} />
          </Routes>
        </main>

        <footer>
          <div className="footer-container">
            <div className="footer-contacts">
              <p>Контакти:</p>
              <p>Email: <a href="mailto:support@fashionstore.com">support@fashionstore.com</a></p>
              <p>Гаряча лінія: <a href="tel:+380123456789">+38 (xxx) xxx-xx-xx</a></p>
            </div>
            <div className="footer-links">
              <Link to="/about">Про нас</Link>
            </div>
            <div className="footer-bottom">
              &copy; 2026 FashionStore. Всі права захищені.
            </div>
          </div>
        </footer>

      </div> {/* /app-wrapper */}
    </>
  );
}

export default App;