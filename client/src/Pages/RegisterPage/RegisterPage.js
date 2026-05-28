import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import "./RegisterPage.css";

const RegisterPage = () => {
  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [error, setError] = useState({});
  const navigate = useNavigate();

  const euCountriesAndUkraine = [
    "UA", "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", 
    "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", 
    "SK", "SI", "ES", "SE",
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError({});

    if (form.password !== form.confirmPassword) {
      setError({ confirmPassword: "Паролі не співпадають" });
      return;
    }

    if (!form.phone) {
      setError({ phone: "Введіть номер телефону" });
      return;
    }

    try {
      const res = await fetch("/api/auth/registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${form.surname} ${form.name}`.trim(),
          email: form.email,
          password: form.password,
          phone: form.phone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = {};
          data.errors.forEach((err) => {
            errorMessages[err.param || 'global'] = err.msg;
          });
          setError(errorMessages);
        } else {
          setError({ global: data.message || "Помилка реєстрації" });
        }
        return;
      }

      localStorage.setItem("token", data.token);
      alert("Реєстрація успішна!");
      window.location.href = '/'; // Перезавантаження для оновлення Header
    } catch (err) {
      setError({ global: err.message || "Помилка з'єднання" });
    }
  };

  return (
    <div className="register-page-container">
      <div className="register-card">
        <h1 className="zagolovok">Створити акаунт</h1>
        <p className="subtitle">Будь ласка, заповніть дані для реєстрації</p>
        
        {error.global && <p className="error-text global-error">{error.global}</p>}
        
        <form onSubmit={handleRegister} className="register-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Прізвище</label>
              <input
                name="surname"
                type="text"
                placeholder="Прізвище"
                value={form.surname}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Ім'я</label>
              <input
                name="name"
                type="text"
                placeholder="Ім'я"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Телефон</label>
            <PhoneInput
              international
              defaultCountry="UA"
              value={form.phone}
              onChange={(phone) => setForm({ ...form, phone })}
              placeholder="+380 50 123 4567"
              countries={euCountriesAndUkraine}
              className="phone-input-field"
            />
            {error.phone && <p className="error-text">{error.phone}</p>}
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              name="email"
              type="email"
              placeholder="example@mail.com"
              value={form.email}
              onChange={handleChange}
              required
            />
            {error.email && <p className="error-text">{error.email}</p>}
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Пароль</label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Підтвердження</label>
              <input
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          {error.confirmPassword && <p className="error-text">{error.confirmPassword}</p>}

          <button type="submit" className="register-submit-btn">
            Зареєструватися
          </button>
        </form>

        <div className="login-redirect">
          <span>Вже маєте акаунт? </span>
          <Link to="/login" className="login-link">Увійти</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;