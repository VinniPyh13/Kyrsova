import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Link перенесено сюди
import "./LoginPage.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Логін не вдався");

      localStorage.setItem("token", data.token);
      sessionStorage.setItem("toast", "Вхід успішний! Раді вас бачити.");
      window.location.href = '/';
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="login-container" style={{ padding: "2rem" }}>
        <h1 className="zagolovok">Вхід до облікового запису</h1>
        <form onSubmit={handleLogin} className="form-container">
          <div className="form-row">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-row">
            <label>Пароль:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-message" style={{ color: "red" }}>{error}</p>}
          <button type="submit" className="login-button">
            Увійти
          </button>
        </form>

        <div className="register-prompt">
          <span>Немає акаунту? </span>
          <Link to="/registration" className="register-btn">
            Зареєструватися
          </Link>
        </div>
      </div>
    </div>
  );
};

export { LoginPage };