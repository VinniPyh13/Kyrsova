import React, { useEffect, useState } from "react";
import { LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import "./AnalyticsPage.css";

export function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("/api/admin/analytics", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        // За замовчуванням виділяємо останній місяць (поточний)
        const lastMonth = json.monthlySummaryData?.[json.monthlySummaryData.length - 1];
        if (lastMonth) setSelectedMonth(lastMonth);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Помилка клієнта аналітики:", err);
        setLoading(false);
      });
  }, [token]);

  if (loading) return <div className="loading-container"><p>Обчислення метрик ефективності ШІ...</p></div>;
  if (!data) return <div className="loading-container"><p>Помилка завантаження модулю аналітики</p></div>;

  const handleBarClick = (barData) => {
    if (!barData?.activeLabel) return;
    const monthData = data.monthlySummaryData?.find((m) => m.month === barData.activeLabel);
    if (monthData) setSelectedMonth(monthData);
  };

  const displayRevenue = selectedMonth ? selectedMonth.revenue : data.summary.totalRevenue;
  const displayOrders = selectedMonth ? selectedMonth.orders : data.summary.totalOrdersCount;
  const displayAiOrders = selectedMonth ? selectedMonth.aiOrders : data.summary.aiAssistedOrders;
  const displayMonthLabel = selectedMonth ? selectedMonth.month : "поточний місяць";

  return (
    <div className="analytics-wrapper">
      <h1 className="analytics-title">Моніторинг ефективності інтернет-магазину</h1>
      <p className="analytics-subtitle">Аналіз впливу інтегрованого ШІ-асистента на бізнес-метрики (Експериментальні дані фокус-груп)</p>

      {/* Віджети з цифрами */}
      <div className="metrics-grid">
        <div className="metric-card card-purple">
          <h3>Загальний дохід</h3>
          <p className="metric-val">{displayRevenue} грн</p>
          <span className="metric-note">{displayMonthLabel}</span>
        </div>
        <div className="metric-card card-blue">
          <h3>Всього замовлень</h3>
          <p className="metric-val">{displayOrders} шт.</p>
          <span className="metric-note">{displayMonthLabel}</span>
        </div>
        <div className="metric-card card-green">
          <h3>Замовлення за участю ШІ</h3>
          <p className="metric-val">{displayAiOrders} шт.</p>
          <span className="metric-note">{displayMonthLabel}</span>
        </div>
        <div className="metric-card card-orange">
          <h3>Активні товари</h3>
          <p className="metric-val">{data.summary.totalProducts} од.</p>
          <span className="metric-note">Доступно в каталозі</span>
        </div>
      </div>

      {/* Графіки */}
      <div className="charts-grid">

        {/* Графік 1: Обсяг продажів */}
        <div className="chart-container">
          <h2>
            Порівняльний обсяг продажів (грн)
            {selectedMonth && (
              <span className="chart-selected-label"> — {selectedMonth.month}</span>
            )}
          </h2>
          <p className="chart-hint">Натисніть на місяць, щоб побачити його показники у картках вище</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.monthlySalesData} onClick={handleBarClick} style={{ cursor: "pointer" }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="без_ШІ" name="Традиційні продажі" fill="#94a3b8" stroke="none" activeBar={{ stroke: "none", strokeWidth: 0 }}>
                {data.monthlySalesData.map((entry) => (
                  <Cell
                    key={entry.month}
                    fill={selectedMonth?.month === entry.month ? "#64748b" : "#94a3b8"}
                  />
                ))}
              </Bar>
              <Bar dataKey="з_ШІ" name="Продажі через ШІ-чат" fill="#d8a051" stroke="none" activeBar={{ stroke: "none", strokeWidth: 0 }}>
                {data.monthlySalesData.map((entry) => (
                  <Cell
                    key={entry.month}
                    fill={selectedMonth?.month === entry.month ? "#b8722a" : "#d8a051"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Графік 2: Конверсія */}
        <div className="chart-container">
          <h2>Коефіцієнт конверсії сайту (Conversion Rate, %)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.conversionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis unit="%" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Звичайна_конверсія" stroke="#ef4444" strokeWidth={3} name="Базова конверсія каталогу" />
              <Line type="monotone" dataKey="Конверсія_через_ШІ" stroke="#10b981" strokeWidth={3} name="Конверсія користувачів ШІ" />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}
