import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthUser from '../../hooks/useAuthUser';
import { showToast } from '../../utils/toast';
import './NewOrderPage.css';

function NewOrderPage() {
  const authUser = useAuthUser();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    city: '',
    warehouse: ''
  });
  const [cities, setCities] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const paypalRendered = useRef(false);
  const [isFormValid, setIsFormValid] = useState(false);

  // Додай ці стани до компонентів
const [searchTerm, setSearchTerm] = useState('');
const [filteredCities, setFilteredCities] = useState([]);
const [showDropdown, setShowDropdown] = useState(false);

const [showSuccessPopup, setShowSuccessPopup] = useState(false);

useEffect(() => {
  if (searchTerm.trim() === '') {
    setFilteredCities([]);
    setShowDropdown(false);
    return;
  }

  const query = searchTerm.toLowerCase();

  const results = cities
    .filter(city => city.Description.toLowerCase().includes(query))
    .sort((a, b) => {
      const nameA = a.Description.toLowerCase();
      const nameB = b.Description.toLowerCase();

      // 1. Пріоритет: 100% співпадіння
      if (nameA === query && nameB !== query) return -1;
      if (nameB === query && nameA !== query) return 1;

      // 2. Пріоритет: починається з введеного тексту
      const startsWithA = nameA.startsWith(query);
      const startsWithB = nameB.startsWith(query);
      if (startsWithA && !startsWithB) return -1;
      if (startsWithB && !startsWithA) return 1;

      // 3. Пріоритет: алфавітний порядок для решти
      return nameA.localeCompare(nameB);
    })
    .slice(0, 10); // Обмежуємо до 10 результатів для швидкості

  setFilteredCities(results);
  setShowDropdown(true);
}, [searchTerm, cities]);

// Функція при виборі міста з результатів пошуку
const selectCity = (city) => {
  setSearchTerm(city.Description);
  setUserData(prev => ({ ...prev, city: city.Ref }));
  setShowDropdown(false);
  
  // Завантажуємо відділення для вибраного міста
  fetchWarehouses(city.Ref);
};

// Винесемо завантаження відділень в окрему функцію для зручності
const fetchWarehouses = async (cityRef) => {
  try {
    const res = await fetch(`/api/novaposhta/warehouses?cityRef=${cityRef}`);
    const data = await res.json();
    setWarehouses(data);
  } catch (err) {
    console.error('Помилка відділень:', err);
  }
};

  const validateForm = () => {
    const { name, surname, email, phone, city, warehouse } = userData;
    return name && surname && email && phone && city && warehouse;
  };

  useEffect(() => {
    setIsFormValid(validateForm());
  }, [userData]);

  useEffect(() => {
    if (authUser) {
      const [lastName = '', firstName = ''] = (authUser.name || '').split(' ');
      setUserData(prev => ({
        ...prev,
        surname: lastName,
        name: firstName,
        email: authUser.email || '',
        phone: authUser.phone || '',
      }));
    }
  }, [authUser]);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch('/api/cart', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Не вдалося отримати кошик');
        const data = await res.json();
        setCart(data);
      } catch (err) {
        console.error('Помилка завантаження кошика:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchCities = async () => {
      try {
        const res = await fetch('/api/novaposhta/cities');
        const data = await res.json();
        if(data && data.data) setCities(data.data);
      } catch (err) {
        console.error('Помилка отримання міст:', err);
      }
    };

    fetchCart();
    fetchCities();
  }, [token]);

  useEffect(() => {
    if (paymentMethod !== 'paypal') {
      paypalRendered.current = false;
      const container = document.getElementById('paypal-button-container');
      if (container) container.innerHTML = '';
      return;
    }

    if (!window.paypal || !cart || !isFormValid || paypalRendered.current) return;

    paypalRendered.current = true;
    const container = document.getElementById('paypal-button-container');
    if (container) container.innerHTML = '';

    window.paypal.Buttons({
  createOrder: (data, actions) => {
    const exchangeRate = 40;
    const totalUSD = (cart.total / exchangeRate).toFixed(2);
    return actions.order.create({
      purchase_units: [{
        amount: {
          value: totalUSD,
          currency_code: 'USD',
        }
      }]
    });
  },
  onApprove: async (data, actions) => {
    try {
      // 1. Знімаємо кошти через PayPal (це у тебе вже працює!)
      const payment = await actions.order.capture();
      console.log('Оплата PayPal успішна. ID транзакції:', payment.id);

      // 2. ТЕПЕР ЗБЕРІГАЄМО ЗАМОВЛЕННЯ В НАШУ БАЗУ ДАНИХ (MongoDB)
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cart.items.map(item => ({
            product: item.product?._id || item.book?._id,
            quantity: item.quantity,
            priceSnapshot: item.priceSnapshot,
            selectedColor: item.selectedColor,
            selectedSize: item.selectedSize,
            addedVia: item.addedVia
          })),
          total: cart.total,
          city: userData.city,
          warehouse: userData.warehouse,
          deliveryDate: new Date().toISOString(),
          contact: {
            name: userData.name,
            surname: userData.surname,
            email: userData.email,
            phone: userData.phone
          },
          paymentMethod: 'paypal',
          paypalPaymentId: payment.id
        }),
      });

      if (!res.ok) throw new Error('Помилка збереження замовлення на бекенді');

      // 3. ПОКАЗУЄМО ПОПАП УСПІХУ І ПЕРЕКИДАЄМО НА ІСТОРІЮ
      setShowSuccessPopup(true);
      setTimeout(() => {
        window.location.href = '/my_orders';
      }, 3000);

    } catch (error) {
      console.error('Помилка після успішної оплати:', error);
      showToast('Гроші знято, але виникла помилка на сервері. Зверніться до підтримки.', 'error');
    }
  }
}).render('#paypal-button-container');

    return () => { paypalRendered.current = false; };
  }, [paymentMethod, isFormValid, cart?.total]);

  const handleCityChange = async (event) => {
    const cityRef = event.target.value;
    setUserData(prev => ({ ...prev, city: cityRef }));
    try {
      const res = await fetch(`/api/novaposhta/warehouses?cityRef=${cityRef}`);
      const data = await res.json();
      setWarehouses(data);
    } catch (err) {
      console.error('Помилка відділень:', err);
    }
  };

  const handlePlaceOrder = async () => {
  if (!cart || !cart.items.length) return;
  setPlacingOrder(true);
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        items: cart.items.map(item => ({
          product: item.product?._id || item.book?._id,
          quantity: item.quantity,
          priceSnapshot: item.priceSnapshot,
          selectedColor: item.selectedColor,
          selectedSize: item.selectedSize,
          addedVia: item.addedVia
        })),
        total: cart.total,
        city: userData.city,
        warehouse: userData.warehouse,
        deliveryDate: new Date().toISOString(),
        contact: {
          name: userData.name,
          surname: userData.surname,
          email: userData.email,
          phone: userData.phone
        },
        paymentMethod: 'cod'
      }),
    });

    if (!res.ok) throw new Error('Не вдалося створити замовлення');

    // ЗАМІСТЬ navigate ОДРАЗУ — ПОКАЗУЄМО ПОПАП
    setShowSuccessPopup(true);

    // ЧЕРЕЗ 3 СЕКУНДИ ПЕРЕКИДАЄМО НА СТОРІНКУ ЗАМОВЛЕНЬ
    setTimeout(() => {
      window.location.href = '/my_orders';
    }, 3000);

  } catch (err) {
    showToast('Сталася помилка при оформленні замовлення', 'error');
  } finally {
    setPlacingOrder(false);
  }
};

  if (loading) return <div className="loading-screen">Завантаження замовлення...</div>;
  if (!cart || !cart.items.length) return <div className="empty-cart-screen">Кошик порожній</div>;

  return (
    <div className="order-page-wrapper">
      <div className="order-main-container">
        <h1 className="order-main-title">Оформлення замовлення</h1>

        <div className="order-grid">
          {/* Ліва колонка: Дані та Доставка */}
          <div className="order-checkout-section">
            <section className="checkout-block">
              <h2 className="block-title">1. Контактні дані</h2>
              <div className="input-grid">
                <input 
                  type="text"
                  placeholder="Ім'я" 
                  value={userData.name}
                  onChange={e => setUserData(prev => ({ ...prev, name: e.target.value }))}
                />
                <input 
                  type="text"
                  placeholder="Прізвище" 
                  value={userData.surname}
                  onChange={e => setUserData(prev => ({ ...prev, surname: e.target.value }))}
                />
              </div>
              <input 
                type="email"
                placeholder="Електронна пошта" 
                value={userData.email}
                onChange={e => setUserData(prev => ({ ...prev, email: e.target.value }))}
              />
              <input 
                type="tel"
                placeholder="Номер телефону" 
                value={userData.phone}
                onChange={e => setUserData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </section>

            <section className="checkout-block">
  <h2 className="block-title">
    2. Доставка — Нова Пошта
    <img
      src={`${process.env.PUBLIC_URL}/np-logomark-red.png`}
      alt="Нова Пошта"
      className="delivery-logo"
    />
  </h2>
  
  <div className="city-search-container">
    <input
      type="text"
      placeholder="Введіть назву міста..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      onFocus={() => searchTerm && setShowDropdown(true)}
    />

    {showDropdown && filteredCities.length > 0 && (
      <ul className="search-results-dropdown">
        {filteredCities.map(city => (
          <li key={city.Ref} onClick={() => selectCity(city)}>
            {city.Description}
          </li>
        ))}
      </ul>
    )}
  </div>

  <div className="select-wrapper">
    <select 
      disabled={!userData.city} 
      onChange={e => setUserData(prev => ({ ...prev, warehouse: e.target.value }))}
      value={userData.warehouse}
    >
      <option value="">Оберіть відділення</option>
      {warehouses.map((wh, idx) => (
        <option key={idx} value={wh.description}>
          {wh.number ? `№${wh.number} — ${wh.address}` : wh.address}
        </option>
      ))}
    </select>
  </div>
</section>

            <section className="checkout-block">
              <h2 className="block-title">3. Спосіб оплати</h2>
              <div className="payment-grid">
                <label className={`payment-card ${paymentMethod === 'cod' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                  <div className="payment-info">
                    <span className="payment-name">Післяплата при отриманні</span>
                  </div>
                </label>

                <label className={`payment-card ${paymentMethod === 'paypal' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'paypal'}
                    onChange={() => setPaymentMethod('paypal')}
                  />
                  <div className="payment-info">
                    <span className="payment-name">PayPal / Картка</span>
                    <small>Миттєва онлайн оплата</small>
                  </div>
                </label>
              </div>
            </section>
          </div>

          {/* Права колонка: Підсумок замовлення */}
          <aside className="order-summary-sidebar">
            <div className="summary-card">
              <h2 className="summary-title">Ваше замовлення</h2>
              <div className="summary-items-list">
                {cart.items.map(item => {
                  const productData = item.product || item.book; 
                  if (!productData) return null;
                  return (
                    <div key={item._id} className="summary-item">
                      <div className="summary-item-img">
                        <img src={productData.images?.[0] || "https://via.placeholder.com/60"} alt={productData.title} />
                      </div>
                      <div className="summary-item-content">
                        <h4 className="item-name">{productData.title}</h4>
                        {/* ВІДОБРАЖЕННЯ РОЗМІРУ ТА КОЛЬОРУ */}
                        <div className="item-variants">
                          {item.selectedSize && <span>Розмір: <b>{item.selectedSize}</b></span>}
                          {item.selectedColor && <span>Колір: <b>{item.selectedColor}</b></span>}
                        </div>
                        <div className="item-price-qty">
                          {item.quantity} × {item.priceSnapshot} грн
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="summary-totals">
                <div className="total-row">
                  <span>Сума:</span>
                  <span>{cart.total} грн</span>
                </div>
                <div className="total-row">
                  <span>Доставка:</span>
                  <span>За тарифами перевізника</span>
                </div>
                <div className="total-row final-price">
                  <span>Разом:</span>
                  <span>{cart.total} грн</span>
                </div>
              </div>

              <div className="summary-actions">
                {paymentMethod === 'cod' ? (
                  <button 
                    className="main-checkout-btn" 
                    onClick={handlePlaceOrder} 
                    disabled={placingOrder || !isFormValid}
                  >
                    {placingOrder ? 'Оформлення...' : 'Підтвердити замовлення'}
                  </button>
                ) : (
                  <div className="paypal-wrapper">
                    <p className="paypal-wrapper-label">Оплатіть безпечно через PayPal або карткою</p>
                    <div id="paypal-button-container"></div>
                  </div>
                )}
                <button className="go-back-btn" onClick={() => navigate(-1)}>Повернутися до кошика</button>
              </div>
            </div>
          </aside>
        </div>
      </div>
      {showSuccessPopup && (
  <div className="success-popup-overlay">
    <div className="success-popup-content">
      <div className="success-icon">✓</div>
      <h2>Замовлення успішно оформлено!</h2>
      <p>Дякуємо за покупку. Зараз ви будете перенаправлені до ваших замовлень...</p>
      <div className="loading-bar"></div>
    </div>
  </div>
)}
    </div>
  );
}

export { NewOrderPage };