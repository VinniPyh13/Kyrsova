import React, { useState } from 'react';
import './AboutUsPage.css';

export function AboutUsPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState({ loading: false, success: null, message: '' });

  // Сюди встав ключ, який прийшов тобі на пошту artempm318@gmail.com
  const WEB3FORMS_KEY = "62b55085-a9ba-4c53-b149-4c7234f91581"; 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: null, message: '' });

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          name: formData.name,
          email: formData.email,
          message: formData.message,
          subject: `Нове повідомлення від клієнта FashionStore: ${formData.name}`
        })
      });

      const result = await response.json();

      if (result.success) {
        setStatus({ loading: false, success: true, message: "Дякуємо! Ваше повідомлення успішно надіслано. Ми зв'яжемося з вами найближчим часом." });
        setFormData({ name: '', email: '', message: '' }); // Очищення форми
      } else {
        throw new Error(result.message || "Помилка відправки");
      }
    } catch (error) {
      console.error("Web3Forms Error:", error);
      setStatus({ loading: false, success: false, message: "Сталася помилка при відправці. Спробуйте пізніше." });
    }
  };

  return (
    <div className="about-page-wrapper">
      <div className="about-container">
        
        {/* Блок інформації про магазин */}
        <section className="about-info-section">
          <div className="about-info-inner">
            <div className="about-info-text">
              <h1 className="about-title">Про наш магазин</h1>
              <p className="about-text">
                Ласкаво просимо до <strong>FashionStore</strong> — сучасного концептуального простору онлайн-шопінгу, де стиль зустрічається з передовими технологіями розробки. Ми прагнемо переосмислити традиційний електронний ритейл, роблячи вибір одягу простим, швидким та індивідуальним.
              </p>
              <p className="about-text">
                Головна інновація нашої платформи — <strong>інтегрований ШІ-стиліст</strong>. Він аналізує ваші побажання в реальному часі та надає персоналізовані рекомендації гардеробу.
              </p>
              <div className="about-features">
                <div className="feature-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/><rect x="9" y="11" width="14" height="10" rx="2"/><circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/></svg>
                  Швидка доставка «Нова Пошта»
                </div>
                <div className="feature-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  Безпечні платежі PayPal
                </div>
                <div className="feature-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                  Інтелектуальний ШІ-асистент
                </div>
              </div>
            </div>
            <div className="about-info-image">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80"
                alt="FashionStore"
                className="about-store-img"
              />
            </div>
          </div>
        </section>

        {/* Блок зворотного зв'язку */}
        <section className="about-contact-section">
          <h2>Зв'язатись з нами</h2>
          <p className="contact-subtitle">Маєте запитання чи пропозиції? Заповніть форму, і лист прийде безпосередньо адміністрації магазину.</p>

          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label htmlFor="name">Ваше ім'я</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Введіть ім'я"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Ваш Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Повідомлення</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Опишіть ваше запитання..."
                rows="5"
                required
              ></textarea>
            </div>

            <button type="submit" className="contact-submit-btn" disabled={status.loading}>
              {status.loading ? "Надсилання..." : "Надіслати повідомлення"}
            </button>

            {status.message && (
              <div className={`form-alert ${status.success ? 'alert-success' : 'alert-error'}`}>
                {status.message}
              </div>
            )}
          </form>
        </section>

      </div>
    </div>
  );
}