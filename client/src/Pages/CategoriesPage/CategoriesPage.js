import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Додано імпорт
import "./CategoriesPage.css";

function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Стан модального вікна
  const [modalType, setModalType] = useState(null); // 'category' або 'subcategory'
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
  });
  
  const token = localStorage.getItem("token");
  const navigate = useNavigate(); // Ініціалізація навігації

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, subcatRes] = await Promise.all([
          fetch("/api/categories", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/subcategories", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const categoriesData = await catRes.json();
        const subcategoriesData = await subcatRes.json();
        setCategories(categoriesData);
        setSubcategories(subcategoriesData);
      } catch (err) {
        console.error("Помилка при завантаженні категорій:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const openModal = (type, item = null) => {
    setModalType(type);
    
    // Якщо item має _id - це редагування. Якщо тільки categoryId - це створення підкатегорії для конкретної категорії
    setEditingItem(item && item._id ? item : null); 
    
    setFormData({
      name: item?.name || "",
      description: item?.description || "",
      categoryId: item?.categoryId || "",
    });
  };

  const closeModal = () => {
    setModalType(null);
    setEditingItem(null);
    setFormData({ name: "", description: "", categoryId: "" });
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Увага! Видалення категорії може вплинути на товари. Продовжити?")) return;
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setCategories(categories.filter((cat) => cat._id !== id));
      // Також локально видаляємо прив'язані підкатегорії для актуальності UI
      setSubcategories(subcategories.filter((sub) => sub.categoryId !== id));
    } catch (err) {
      alert("Помилка при видаленні категорії. Можливо, до неї ще прив'язані товари.");
    }
  };

  const handleDeleteSubcategory = async (id) => {
    if (!window.confirm("Видалити цю підкатегорію?")) return;
    try {
      const res = await fetch(`/api/subcategories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setSubcategories(subcategories.filter((sub) => sub._id !== id));
    } catch (err) {
      alert("Помилка при видаленні підкатегорії.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isEditing = !!editingItem;
    const isCategory = modalType === "category";

    const url = isCategory
      ? `/api/categories${isEditing ? `/${editingItem._id}` : ""}`
      : `/api/subcategories${isEditing ? `/${editingItem._id}` : ""}`;

    const method = isEditing ? "PUT" : "POST";
    const bodyToSend = { name: formData.name };

    if (isCategory) {
      bodyToSend.description = formData.description;
    } else {
      if (!formData.categoryId) {
        alert("Будь ласка, виберіть категорію");
        return;
      }
      bodyToSend.categoryId = formData.categoryId;
    }

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyToSend),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Помилка збереження");

      if (isCategory) {
        if (isEditing) {
          setCategories(categories.map((cat) => (cat._id === data._id ? data : cat)));
        } else {
          setCategories([...categories, data]);
        }
      } else {
        // Оновлюємо підкатегорії
        const subcatRes = await fetch("/api/subcategories", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const subcategoriesData = await subcatRes.json();
        setSubcategories(subcategoriesData);
      }

      closeModal();
    } catch (err) {
      alert(err.message || "Помилка оновлення");
    }
  };

  if (loading) return <div className="loading-container">Завантаження категорій...</div>;

  return (
    <div className="categories-page-wrapper">
      <div className="categories-container">
        
        <div className="categories-header">
          <div>
            {/* ДОДАНО КНОПКУ НАЗАД */}
            <button onClick={() => navigate('/admin')} className="btn-back-admin">
              ← Назад до адмін-панелі
            </button>
            <h1 className="page-title">Структура каталогу</h1>
            <p className="page-subtitle">Управління категоріями та підкатегоріями товарів</p>
          </div>
          <button onClick={() => openModal("category")} className="btn-primary">
            <span className="icon">+</span> Додати категорію
          </button>
        </div>

        <div className="categories-grid">
          {categories.map((category) => {
            const catSubcategories = subcategories.filter((sub) => sub.categoryId === category._id);

            return (
              <div key={category._id} className="category-card">
                <div className="category-card-header">
                  <div className="category-info">
                    <h2 className="category-name">{category.name}</h2>
                    {category.description && (
                      <p className="category-desc">{category.description}</p>
                    )}
                  </div>
                  <div className="category-actions">
                    <button onClick={() => openModal("category", category)} className="icon-btn edit" title="Редагувати">
                      ✎
                    </button>
                    <button onClick={() => handleDeleteCategory(category._id)} className="icon-btn delete" title="Видалити">
                      ×
                    </button>
                  </div>
                </div>

                <div className="subcategories-section">
                  <div className="subcat-header">
                    <h3>Підкатегорії ({catSubcategories.length})</h3>
                    <button 
                      onClick={() => openModal("subcategory", { categoryId: category._id })} 
                      className="btn-text"
                    >
                      + Додати
                    </button>
                  </div>
                  
                  <div className="subcategories-chips">
                    {catSubcategories.length > 0 ? (
                      catSubcategories.map((sub) => (
                        <div key={sub._id} className="subcat-chip">
                          <span className="subcat-name">{sub.name}</span>
                          <div className="subcat-chip-actions">
                            <button onClick={() => openModal("subcategory", sub)} className="chip-btn">✎</button>
                            <button onClick={() => handleDeleteSubcategory(sub._id)} className="chip-btn danger">×</button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <span className="empty-text">Немає підкатегорій</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Модальне вікно */}
        {modalType && (
          <div className="modal-backdrop" onClick={closeModal}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>
                  {editingItem ? "Редагування " : "Нова "}
                  {modalType === "category" ? "категорія" : "підкатегорія"}
                </h2>
                <button className="close-modal-btn" onClick={closeModal}>×</button>
              </div>

              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                  <label>Назва {modalType === "category" ? "категорії" : "підкатегорії"}</label>
                  <input
                    type="text"
                    placeholder="Наприклад: Чоловічий одяг"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                {modalType === "category" ? (
                  <div className="form-group">
                    <label>Опис (необов'язково)</label>
                    <textarea
                      placeholder="Короткий опис для клієнтів..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows="3"
                    />
                  </div>
                ) : (
                  <div className="form-group">
                    <label>Належить до категорії</label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      required
                    >
                      <option value="" disabled>Оберіть батьківську категорію</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="modal-footer">
                  <button type="button" onClick={closeModal} className="btn-secondary">
                    Скасувати
                  </button>
                  <button type="submit" className="btn-primary">
                    Зберегти
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}

export { CategoriesPage };