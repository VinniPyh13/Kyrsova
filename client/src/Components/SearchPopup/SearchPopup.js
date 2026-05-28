import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchPopup.css';

const SearchPopup = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [gender, setGender] = useState('women'); // За замовчуванням "Жінкам"
  const navigate = useNavigate();

  // Блокуємо скролінг сторінки, коли попап відкритий
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSearch = (e) => {
    e.preventDefault();
    onClose(); // Закриваємо попап
    
    // Формуємо URL з параметром пошуку, якщо текст введено
    const queryParam = searchTerm.trim() ? `?search=${encodeURIComponent(searchTerm.trim())}` : '';
    navigate(`/category/${gender}${queryParam}`);
    
    // Очищаємо поле для наступного разу
    setSearchTerm('');
  };

  return (
    <div className="search-popup-overlay" onClick={onClose}>
      <div className="search-popup-content" onClick={(e) => e.stopPropagation()}>
        <button className="search-popup-close" onClick={onClose}>&times;</button>
        
        <h2>Пошук товарів</h2>
        
        <form onSubmit={handleSearch} className="search-popup-form">
          <input 
            type="text" 
            className="search-popup-input"
            placeholder="Я шукаю..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />

          <div className="search-popup-gender-selector">
            <label className={`gender-radio ${gender === 'women' ? 'active' : ''}`}>
              <input 
                type="radio" 
                name="gender" 
                value="women" 
                checked={gender === 'women'} 
                onChange={() => setGender('women')} 
              />
              Жінкам
            </label>
            <label className={`gender-radio ${gender === 'men' ? 'active' : ''}`}>
              <input 
                type="radio" 
                name="gender" 
                value="men" 
                checked={gender === 'men'} 
                onChange={() => setGender('men')} 
              />
              Чоловікам
            </label>
          </div>

          <button type="submit" className="search-popup-submit">Знайти</button>
        </form>
      </div>
    </div>
  );
};

export default SearchPopup;