import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import "./RegisterPage.css";

const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const codeRefs = useRef([]);

  const euCountriesAndUkraine = [
    "UA", "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE",
    "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO",
    "SK", "SI", "ES", "SE",
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Крок 1: відправка форми → запит коду
  const handleSendCode = async (e) => {
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

    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-code", {
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
        if (data.errors) {
          const msgs = {};
          data.errors.forEach((e) => { msgs[e.param || "global"] = e.msg; });
          setError(msgs);
        } else {
          setError({ global: data.message || "Помилка" });
        }
        return;
      }

      setStep(2);
      startResendCooldown();
    } catch (err) {
      setError({ global: "Помилка з'єднання" });
    } finally {
      setLoading(false);
    }
  };

  // Крок 2: підтвердження коду
  const handleVerify = async (e) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length < 6) {
      setError({ code: "Введіть 6-значний код" });
      return;
    }

    setLoading(true);
    setError({});
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, code: fullCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError({ code: data.message || "Невірний код" });
        return;
      }

      localStorage.setItem("token", data.token);
      window.location.href = "/";
    } catch (err) {
      setError({ code: "Помилка з'єднання" });
    } finally {
      setLoading(false);
    }
  };

  // Повторна відправка коду
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError({});
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${form.surname} ${form.name}`.trim(),
          email: form.email,
          password: form.password,
          phone: form.phone,
        }),
      });
      if (res.ok) {
        setCode(["", "", "", "", "", ""]);
        startResendCooldown();
      } else {
        const data = await res.json();
        setError({ global: data.message || "Помилка повторної відправки" });
      }
    } catch {
      setError({ global: "Помилка з'єднання" });
    } finally {
      setLoading(false);
    }
  };

  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // Обробка вводу цифр коду
  const handleCodeChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value && index < 5) codeRefs.current[index + 1]?.focus();
  };

  const handleCodeKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newCode = [...code];
    pasted.split("").forEach((char, i) => { newCode[i] = char; });
    setCode(newCode);
    codeRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <div className="register-page-container">
      <div className="register-card">
        {step === 1 ? (
          <>
            <h1 className="zagolovok">Створити акаунт</h1>
            <p className="subtitle">Будь ласка, заповніть дані для реєстрації</p>

            {error.global && <p className="error-text global-error">{error.global}</p>}

            <form onSubmit={handleSendCode} className="register-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Прізвище</label>
                  <input name="surname" type="text" placeholder="Прізвище" value={form.surname} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Ім'я</label>
                  <input name="name" type="text" placeholder="Ім'я" value={form.name} onChange={handleChange} required />
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
                <input name="email" type="email" placeholder="example@mail.com" value={form.email} onChange={handleChange} required />
                {error.email && <p className="error-text">{error.email}</p>}
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Пароль</label>
                  <input name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Підтвердження</label>
                  <input name="confirmPassword" type="password" placeholder="••••••••" value={form.confirmPassword} onChange={handleChange} required />
                </div>
              </div>
              {error.confirmPassword && <p className="error-text">{error.confirmPassword}</p>}

              <button type="submit" className="register-submit-btn" disabled={loading}>
                {loading ? "Надсилання..." : "Зареєструватися"}
              </button>
            </form>

            <div className="login-redirect">
              <span>Вже маєте акаунт? </span>
              <Link to="/login" className="login-link">Увійти</Link>
            </div>
          </>
        ) : (
          <>
            <div className="verify-icon">✉</div>
            <h1 className="zagolovok">Підтвердіть email</h1>
            <p className="subtitle">
              Ми надіслали 6-значний код на<br />
              <strong>{form.email}</strong>
            </p>

            <form onSubmit={handleVerify} className="register-form">
              <div className="code-inputs" onPaste={handleCodePaste}>
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (codeRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(i, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(i, e)}
                    className="code-digit-input"
                    autoFocus={i === 0}
                  />
                ))}
              </div>
              {error.code && <p className="error-text" style={{ textAlign: "center" }}>{error.code}</p>}

              <button type="submit" className="register-submit-btn" disabled={loading}>
                {loading ? "Перевірка..." : "Підтвердити"}
              </button>
            </form>

            <div className="verify-footer">
              <span>Не отримали код? </span>
              <button className="resend-btn" onClick={handleResend} disabled={resendCooldown > 0 || loading}>
                {resendCooldown > 0 ? `Надіслати знову (${resendCooldown}с)` : "Надіслати знову"}
              </button>
            </div>
            <div className="login-redirect">
              <button className="back-btn" onClick={() => { setStep(1); setCode(["","","","","",""]); setError({}); }}>
                ← Повернутися до форми
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
