import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminPage.css";

function AdminPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    // ВИПРАВЛЕНО: Створюємо асинхронну функцію всередині ефекту
    const fetchProducts = async () => {
      try {
        const res = await fetch(
          "/api/products?fields=title price salePrice isSale brand categoryId subcategories variants quantity reviews images",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Не вдалося завантажити товари");
        
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Помилка при завантаженні товарів:", err);
      } finally {
        setLoading(false);
      }
    };

    // Викликаємо її
    fetchProducts();
  }, [token]);

  const navigateToOrders = () => {
    navigate("/admin/all_orders");
  };

  const navigateToCategories = () => {
    navigate("/admin/categories");
  };

  const navigateToAnalytics = () => {
  navigate("/admin/analytics");
  };

  const handleEdit = (id) => {
    navigate(`/admin/edit_product/${id}`);
  };

  const handleAdd = () => {
    navigate(`/admin/add_product`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Ви впевнені, що хочете видалити цей товар?")) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Помилка при видаленні товару");
      setProducts(products.filter((product) => product._id !== id));
    } catch (err) {
      console.error("Помилка:", err);
    }
  };

  if (loading)
    return (
      <div className="loading-container">
        <p>Завантаження товарів...</p>
      </div>
    );

  return (
    <div className="admin-page-wrapper">
      <div className="admin-container">
        <div className="admin-navigation">
          <button onClick={navigateToOrders} className="admin-nav-btn">
            Управління замовленнями
          </button>
          <button onClick={navigateToCategories} className="admin-nav-btn">
            Управління категоріями
          </button>
          <button onClick={navigateToAnalytics} className="admin-nav-btn analytics-btn-style">
            Бізнес-аналітика та ефективність ШІ
          </button>
        </div>

        <div className="admin-header">
          <h1 className="admin-title">Управління товарами</h1>
          <button onClick={handleAdd} className="add-product-btn">
            <span className="plus-icon">+</span> Додати новий товар
          </button>
        </div>

        <div className="product-grid">
          {products.map((product) => {
            const categoryNames =
              (Array.isArray(product.categoryId)
                ? product.categoryId
                : [product.categoryId]
              )
                .filter(Boolean)
                .map((c) => c?.name)
                .join(", ") || "Невідома";

            const subcategoryNames =
              (product.subcategories || []).map((sc) => sc.name).join(", ") ||
              "Немає";

            const averageRating = product.reviews?.length
              ? (
                  product.reviews.reduce((sum, r) => sum + r.rating, 0) /
                  product.reviews.length
                ).toFixed(1)
              : "Немає рейтингу";

            // ОБЧИСЛЕННЯ ЗАГАЛЬНОЇ КІЛЬКОСТІ ЗА ВАРІАЦІЯМИ
            const totalQuantity = Array.isArray(product.variants) && product.variants.length > 0
              ? product.variants.reduce((sum, variant) => sum + (Number(variant.quantity) || 0), 0)
              : (Number(product.quantity) || 0);

            return (
              <div key={product._id} className="product-card">
                <div className="product-image-container">
                  <img
                    src={product.images?.[0] || "/placeholder.jpg"}
                    alt={product.title}
                    className="product-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/placeholder.jpg";
                    }}
                  />
                </div>
                <div className="product-details">
                  <h3 className="product-title">{product.title}</h3>
                  <div className="product-meta">
                    <p>
                      <span className="meta-label">Бренд:</span>{" "}
                      {product.brand || "Невідомо"}
                    </p>
                    <p>
                      <span className="meta-label">Категорія:</span>{" "}
                      {categoryNames}
                    </p>
                    <p>
                      <span className="meta-label">Підкатегорії:</span>{" "}
                      {subcategoryNames}
                    </p>
                    
                    <p className="stock-info">
                      <span className="meta-label">Склад:</span>
                      <span
                        className={`stock-count ${totalQuantity < 5 ? "low-stock" : ""}`}
                      >
                        {totalQuantity} шт.
                      </span>
                    </p>
                    
                    <p>
                      <span className="meta-label">Ціна:</span>{" "}
                      {product.isSale && product.salePrice ? (
                        <>
                          <span className="old-price">{product.price}</span>
                          <span className="sale-price">{product.salePrice} грн</span>
                          <span className="sale-badge-mini">Акція</span>
                        </>
                      ) : (
                        <span>{product.price} грн</span>
                      )}
                    </p>
                    <p>
                      <span className="meta-label">Рейтинг:</span>
                      <span
                        className={`rating ${
                          averageRating !== "Немає рейтингу" ? "has-rating" : ""
                        }`}
                      >
                        {averageRating}
                        {averageRating !== "Немає рейтингу" && (
                          <span className="star">★</span>
                        )}
                      </span>
                    </p>
                  </div>
                  <div className="product-actions">
                    <button
                      onClick={() => handleEdit(product._id)}
                      className="edit-btn"
                    >
                      Редагувати
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="delete-btn"
                    >
                      Видалити
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export { AdminPage };