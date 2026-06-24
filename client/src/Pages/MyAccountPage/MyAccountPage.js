import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProductCard from '../../Components/ProductCard';
import { showToast } from '../../utils/toast';
import './MyAccountPage.css';

const MyAccountPage = ({ handleAddToCart }) => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'profile');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [validationError, setValidationError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        // 1. Отримуємо дані користувача
        const resUser = await fetch('/api/users/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const userData = await resUser.json();
        if (!resUser.ok) throw new Error(userData.message || 'Не вдалося отримати дані');
        
        setUser(userData);
        const [firstName = '', lastName = ''] = (userData.name || '').split(' ');
        setFormData({
          firstName,
          lastName,
          email: userData.email || '',
          phone: userData.phone || '',
        });

        // 2. Отримуємо улюблені товари користувача
        const resFav = await fetch(`/api/users/${userData._id}/favorites`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const favData = await resFav.json();
        
        if (resFav.ok && Array.isArray(favData)) {
          setFavorites(favData);
        }
      } catch (err) {
        setError(err.message);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateForm = () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setValidationError('Ім’я та прізвище обов’язкові');
      return false;
    }
    if (!formData.email.includes('@')) {
      setValidationError('Некоректний email');
      return false;
    }
    if (formData.phone && !/^\+?\d{10,15}$/.test(formData.phone)) {
      setValidationError('Телефон має містити лишь цифри (10–15 цифр)');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    try {
      const token = localStorage.getItem('token');
      const updatedData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone
      };

      const res = await fetch(`/api/users/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Помилка оновлення даних');

      setUser(data);
      setIsEditing(false);
      showToast("Дані успішно оновлено!");
    } catch (err) {
      setError(err.message);
    }
  };

  // Метод видалення з обраного безпосередньо з кабінету профілю
  const handleToggleFavoriteInAccount = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/users/favorites/remove`, {
        method: 'DELETE',
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ userId: user._id, productId }),
      });

      if (!res.ok) throw new Error("Не вдалося видалити з обраного");

      // Миттєво прибираємо товар з екрану
      setFavorites(prev => prev.filter(item => item._id !== productId));
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError('');
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users/me', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDeleteError(data.message || 'Помилка видалення');
        return;
      }
      localStorage.removeItem('token');
      navigate('/');
      window.location.reload();
    } catch (e) {
      setDeleteError('Сталася помилка. Спробуйте ще раз.');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (error) return <p className="error-message">{error}</p>;
  if (!user) return <div className="loader">Завантаження даних профілю...</div>;

  return (
    <>
    <div className="account-container">
      <div className="account-sidebar">
        <div className="user-avatar-large">
          {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
        </div>
        <h2 className="user-greeting">Привіт, {formData.firstName}!</h2>
        <p className="user-email-subtitle">{formData.email}</p>

        <nav className="account-nav">
          <button 
            className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Особисті дані
          </button>
          <button 
            className={`nav-btn ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            Список бажань ({favorites.length})
          </button>
          <button className="nav-btn logout" onClick={handleLogout}>
            Вийти з акаунта
          </button>
          <button className="nav-btn delete-account" onClick={() => { setShowDeleteModal(true); setDeletePassword(''); setDeleteError(''); }}>
            Видалити акаунт
          </button>
        </nav>
      </div>

      <div className="account-content">
        {activeTab === 'profile' && (
          <div className="profile-section">
            <h1 className="section-title">Особисті дані</h1>
            <div className="form-grid">
              <div className="input-group">
                <label>Ім'я</label>
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
              <div className="input-group">
                <label>Прізвище</label>
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
              <div className="input-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
              <div className="input-group">
                <label>Телефон</label>
                <input
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  placeholder="+380..."
                  disabled={!isEditing}
                />
              </div>
            </div>

            {validationError && <p className="validation-error">{validationError}</p>}
            
            <div className="profile-actions">
              {isEditing ? (
                <>
                  <button className="btn-save" onClick={handleUpdate}>Зберегти зміни</button>
                  <button className="btn-cancel" onClick={() => setIsEditing(false)}>Скасувати</button>
                </>
              ) : (
                <button className="btn-edit" onClick={() => setIsEditing(true)}>Редагувати профіль</button>
              )}
            </div>
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="favorites-section">
            <h1 className="section-title">Список бажань</h1>
            {favorites.length > 0 ? (
              <ul className="cards account-cards-grid">
                {favorites.map(item => (
                  item ? (
                    <ProductCard 
                      key={item._id} 
                      product={item} 
                      isFavorite={true} // ПРИМУСОВО ПЕРЕДАЄМО TRUE ДЛЯ ЗАКРАШЕННЯ СЕРДЕЧОК!
                      handleAddToCart={handleAddToCart}
                      onToggleFavorite={handleToggleFavoriteInAccount} // Передаємо метод видалення
                    />
                  ) : null
                ))}
              </ul>
            ) : (
              <div className="empty-favorites">
                <p>Тут поки порожньо. Додайте товари, які вам сподобалися!</p>
                <button className="btn-shop-now" onClick={() => navigate('/category/men')}>
                  Перейти до каталогу
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
      {showDeleteModal && (
        <div className="delete-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="delete-modal" onClick={e => e.stopPropagation()}>
            <div className="delete-modal-icon">!</div>
            <h2>Видалити акаунт?</h2>
            <p>Цю дію неможливо скасувати. Ваші особисті дані будуть видалені. Історія замовлень буде анонімізована.</p>
            <div className="delete-modal-field">
              <label>Введіть пароль для підтвердження</label>
              <input
                type="password"
                placeholder="Ваш пароль"
                value={deletePassword}
                onChange={e => setDeletePassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleDeleteAccount()}
              />
            </div>
            {deleteError && <p className="delete-modal-error">{deleteError}</p>}
            <div className="delete-modal-actions">
              <button
                className="delete-modal-confirm"
                onClick={handleDeleteAccount}
                disabled={deleteLoading || !deletePassword}
              >
                {deleteLoading ? 'Видалення...' : 'Підтвердити видалення'}
              </button>
              <button className="delete-modal-cancel" onClick={() => setShowDeleteModal(false)}>
                Скасувати
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export { MyAccountPage };