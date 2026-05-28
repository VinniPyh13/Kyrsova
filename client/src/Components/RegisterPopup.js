import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import "./RegisterPopup.css";

const RegisterPopup = ({ isOpen, onClose }) => {
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
    "UA", // Україна
    "AT", // Австрія
    "BE", // Бельгія
    "BG", // Болгарія
    "HR", // Хорватія
    "CY", // Кіпр
    "CZ", // Чехія
    "DK", // Данія
    "EE", // Естонія
    "FI", // Фінляндія
    "FR", // Франція
    "DE", // Німеччина
    "GR", // Греція
    "HU", // Угорщина
    "IE", // Ірландія
    "IT", // Італія
    "LV", // Латвія
    "LT", // Литва
    "LU", // Люксембург
    "MT", // Мальта
    "NL", // Нідерланди
    "PL", // Польща
    "PT", // Португалія
    "RO", // Румунія
    "SK", // Словаччина
    "SI", // Словенія
    "ES", // Іспанія
    "SE", // Швеція
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
            if (err.param) {
              errorMessages[err.param] = err.msg;
            } else {
              errorMessages.global = err.msg;
            }
          });
          setError(errorMessages);
        } else {
          setError({ global: data.message || "Помилка реєстрації" });
        }
        return;
      }

      localStorage.setItem("token", data.token);
      alert("Реєстрація успішна! Вас увійшло в систему.");
      onClose();
      navigate("/");
    } catch (err) {
      setError({ global: err.message || "Помилка з'єднання" });
    }
  };

  return (
    <div
      className="popup-overlay"
      style={{ display: isOpen ? "flex" : "none" }}
    >
      <div className="popup">
        <div className="popup-header">
          <h2>Реєстрація</h2>
          <span className="close-btn" onClick={onClose}>
            &times;
          </span>
        </div>
        {error.global && <p style={{ color: "red" }}>{error.global}</p>}
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>Прізвище</label>
            <input
              name="surname"
              type="text"
              placeholder="Введіть прізвище"
              value={form.surname}
              onChange={handleChange}
              required
            />
            <label>Name</label>
            <input
              name="name"
              type="text"
              placeholder="Введіть ім'я"
              value={form.name}
              onChange={handleChange}
              required
            />
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
              className="phone-input"
            />
            {error.phone && <p style={{ color: "red" }}>{error.phone}</p>}
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
            {error.email && <p style={{ color: "red" }}>{error.email}</p>}
          </div>
          <div className="form-group">
            <label>Пароль</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Підтвердити пароль</label>
            <input
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
            {error.confirmPassword && (
              <p style={{ color: "red" }}>{error.confirmPassword}</p>
            )}
          </div>
          <button type="submit" className="add-btn">
            Зареєструватися
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPopup;
