import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { showToast } from "../../utils/toast";
import "./EditProductPage.css";

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allCategories, setAllCategories] = useState([]);
  const [allSubcategories, setAllSubcategories] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Дані форми редагування
  const [formData, setFormData] = useState({
    title: "",
    brand: "",
    price: "",
    salePrice: "",
    isSale: false,
    description: "",
    gender: "Унісекс",
    material: "",
    variants: [{ size: "", color: "", quantity: "" }], // Одна порожня варіація за замовчуванням
    categoryId: "",
    subcategories: [],
    images: [],
  });

  useEffect(() => {
    const init = async () => {
      try {
        const categoriesRes = await fetch("/api/categories");
        const categoriesData = await categoriesRes.json();
        setAllCategories(categoriesData);

        const productRes = await fetch(`/api/products/${id}`);
        const productData = await productRes.json();

        const selectedCategoryId = Array.isArray(productData.categoryId)
          ? productData.categoryId[0]?._id || productData.categoryId[0]
          : productData.categoryId?._id || productData.categoryId || "";

        setProduct(productData);
        setFormData({
          title: productData.title || "",
          brand: productData.brand || "",
          price: productData.price || "",
          salePrice: productData.salePrice || "",
          isSale: productData.isSale || false,
          description: productData.description || "",
          gender: productData.gender || "Унісекс",
          material: productData.material || "",
          variants: productData.variants && productData.variants.length > 0 
            ? productData.variants 
            : [{ size: "", color: "", quantity: "" }], // Якщо варіацій немає, ставимо порожню
          categoryId: selectedCategoryId,
          categoryId: selectedCategoryId,
          subcategories: (productData.subcategories || []).map((sc) =>
            typeof sc === "string" ? sc : sc._id
          ),
          images: productData.images || [],
        });

        const selectedCategory = categoriesData.find((cat) => cat._id === selectedCategoryId);
        setAllSubcategories(selectedCategory ? selectedCategory.subcategories : []);
      } catch (err) {
        console.error("Помилка при ініціалізації редагування товару:", err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === "checkbox" ? checked : value;

    setFormData((prevState) => {
      const updatedFormData = { ...prevState, [name]: finalValue };

      if (name === "categoryId") {
        const selectedCategory = allCategories.find((cat) => cat._id === value);
        updatedFormData.subcategories = [];
        setAllSubcategories(selectedCategory ? selectedCategory.subcategories : []);
      }

      return updatedFormData;
    });
  };

  const handleAdminDeleteReview = async (reviewId) => {
    if (!window.confirm("Ви впевнені, що хочете видалити цей коментар?")) return;

    try {
      const res = await fetch(`/api/reviews/admin/${reviewId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Не вдалося видалити коментар");

      setProduct((prev) => ({
        ...prev,
        reviews: prev.reviews.filter((r) => r._id !== reviewId),
      }));
      showToast("Коментар успішно видалено");
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    if (formData.images.length + files.length > 5) {
      showToast("Максимум 5 зображень", 'warning');
      return;
    }

    setUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append("productId", id);
      files.forEach((file) => uploadData.append("files", file));

      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      if (!res.ok) throw new Error("Помилка при завантаженні зображень");

      const data = await res.json();
      // data.product - це об'єкт товару, що повернув сервер після оновлення
      setFormData((prev) => ({ ...prev, images: data.product?.images || data.book?.images || prev.images }));
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (index) => {
    try {
      const newImages = [...formData.images];
      newImages.splice(index, 1);

      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ images: newImages }),
      });

      if (!res.ok) throw new Error("Помилка при видаленні зображення");
      setFormData((prev) => ({ ...prev, images: newImages }));
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Зміна значення в конкретному рядку варіації
  const handleVariantChange = (index, field, value) => {
    const newVariants = [...formData.variants];
    newVariants[index][field] = value;
    setFormData((prev) => ({ ...prev, variants: newVariants }));
  };

  // Додавання нового рядка варіації
  const handleAddVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, { size: "", color: "", quantity: "" }]
    }));
  };

  // Видалення рядка варіації
  const handleRemoveVariant = (index) => {
    const newVariants = [...formData.variants];
    newVariants.splice(index, 1);
    setFormData((prev) => ({ ...prev, variants: newVariants }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { images, ...productData } = formData;

      const formattedData = {
        ...productData,
        price: Number(productData.price),
        salePrice: productData.isSale ? Number(productData.salePrice) : null,
        quantity: Number(productData.quantity),
        categoryId: [productData.categoryId],
        variants: productData.variants.map(v => ({
        size: v.size.trim(),
        color: v.color.trim(),
        quantity: Number(v.quantity)
      })).filter(v => v.size && v.color) // Відкидаємо порожні рядки
};

      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formattedData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Помилка при оновленні товару");
      }

      sessionStorage.setItem("toast", "Товар успішно оновлено!");
      navigate("/admin");
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) return <div className="loading-container"><p>Завантаження...</p></div>;
  if (!product) return <div className="not-found"><h2>Товар не знайдено</h2></div>;

  return (
    <div className="edit-product-page">
      <div className="edit-product-container">
        
        <div className="header-actions">
          <button type="button" onClick={() => navigate("/admin")} className="btn-back-admin">
            ← Назад до панелі
          </button>
          <h1 className="page-title">Редагування товару</h1>
        </div>

        <form onSubmit={handleSubmit} className="form-layout">
          {/* Ліва колонка: Фото та Відгуки */}
          <div className="left-column">
            <div className="image-upload-section">
              <h3 className="section-title">Фотографії товару</h3>
              <div className="image-grid">
                {formData.images.map((img, index) => {
                  const preview = typeof img === "string" ? img : URL.createObjectURL(img);
                  return (
                    <div key={index} className="image-preview-card">
                      <img src={preview} alt={`Зображення ${index + 1}`} className="thumbnail" />
                      <button type="button" onClick={() => handleRemoveImage(index)} className="remove-img-btn">×</button>
                    </div>
                  );
                })}
                {formData.images.length < 5 && (
                  <div className="upload-box">
                    <input type="file" id="file-upload" multiple accept="image/*" onChange={handleFileUpload} />
                    <label htmlFor="file-upload" className="upload-label">
                      <span className="upload-icon">+</span>
                      {uploading ? "Завантаження..." : "Додати фото"}
                    </label>
                  </div>
                )}
              </div>
            </div>

            {product.reviews?.length > 0 && (
              <div className="reviews-section">
                <h3 className="section-title">Відгуки користувачів ({product.reviews.length})</h3>
                <div className="reviews-list">
                  {product.reviews.map((review) => (
                    <div key={review._id} className="review-card">
                      <div className="review-header">
                        <div className="user-info">
                          <span className="user-avatar">{review.userId?.name?.charAt(0) || "А"}</span>
                          <div>
                            <p className="user-name">{review.userId?.name || "Анонім"}</p>
                            <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <button type="button" className="delete-review-btn" onClick={() => handleAdminDeleteReview(review._id)}>×</button>
                      </div>
                      <div className="review-rating">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</div>
                      <p className="review-text">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Права колонка: Дані */}
          <div className="right-column">
            <div className="details-section">
              <h3 className="section-title">Характеристики</h3>
              
              {/* БЛОК АКЦІЇ */}
              <div className="sale-section">
                <label className="sale-toggle">
                  <input type="checkbox" name="isSale" checked={formData.isSale} onChange={handleChange} />
                  <span className="toggle-slider"></span>
                  <span className="toggle-label">Увімкнути акцію (Sale)</span>
                </label>
                
                {formData.isSale && (
                  <div className="sale-price-input">
                    <label>Акційна ціна (грн):</label>
                    <input type="number" name="salePrice" value={formData.salePrice} onChange={handleChange} min="0" required />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Назва:</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required />
              </div>
              
              <div className="form-row">
                <div className="form-group half">
                  <label>Бренд:</label>
                  <input type="text" name="brand" value={formData.brand} onChange={handleChange} required />
                </div>
                <div className="form-group half">
                  <label>Базова ціна (грн):</label>
                  <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Стать:</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="form-input">
                    <option value="Чоловічий">Чоловічий</option>
                    <option value="Жіночий">Жіночий</option>
                    <option value="Унісекс">Унісекс</option>
                    <option value="Дитячий">Дитячий</option>
                  </select>
                </div>
                <div className="form-group half">
                  <label>Матеріал:</label>
                  <input type="text" name="material" value={formData.material} onChange={handleChange} />
                </div>
              </div>

              <div className="variants-section">
  <div className="variants-header">
    <h3 className="section-title">Розміри, кольори та залишки</h3>
    <button type="button" onClick={handleAddVariant} className="add-variant-btn">
      + Додати варіант
    </button>
  </div>
  
  <div className="variants-list">
    {formData.variants.map((variant, index) => (
      <div key={index} className="variant-row">
        <div className="variant-input-group">
          <label>Розмір</label>
          <input
            type="text"
            placeholder="Напр., S, M, 42"
            value={variant.size}
            onChange={(e) => handleVariantChange(index, "size", e.target.value)}
            required
          />
        </div>
        <div className="variant-input-group">
          <label>Колір</label>
          <input
            type="text"
            placeholder="Напр., Чорний"
            value={variant.color}
            onChange={(e) => handleVariantChange(index, "color", e.target.value)}
            required
          />
        </div>
        <div className="variant-input-group quantity-group">
          <label>К-сть (шт)</label>
          <input
            type="number"
            min="0"
            value={variant.quantity}
            onChange={(e) => handleVariantChange(index, "quantity", e.target.value)}
            required
          />
        </div>
        {formData.variants.length > 1 && (
          <button
            type="button"
            onClick={() => handleRemoveVariant(index)}
            className="remove-variant-btn"
            title="Видалити"
          >
            ×
          </button>
        )}
      </div>
    ))}
  </div>
</div>

              <div className="form-group">
                <label>Опис:</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="4" />
              </div>
            </div>

            <div className="categories-section">
              <h3 className="section-title">Категорія</h3>
              <div className="chip-grid">
                {allCategories.map((cat) => (
                  <label key={cat._id} className={`chip-radio ${formData.categoryId === cat._id ? 'active' : ''}`}>
                    <input type="radio" name="categoryId" value={cat._id} checked={formData.categoryId === cat._id} onChange={handleChange} />
                    <span>{cat.name}</span>
                  </label>
                ))}
              </div>
              {allSubcategories.length > 0 && (
                <div className="chip-grid" style={{ marginTop: '15px' }}>
                  {allSubcategories.map((sub) => (
                    <label key={sub._id} className={`chip-checkbox ${formData.subcategories.includes(sub._id) ? 'active' : ''}`}>
                      <input type="checkbox" value={sub._id} checked={formData.subcategories.includes(sub._id)} onChange={(e) => {
                        const val = e.target.value;
                        setFormData((f) => ({
                          ...f, subcategories: e.target.checked ? [...f.subcategories, val] : f.subcategories.filter((i) => i !== val)
                        }));
                      }} />
                      <span>{sub.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit">Зберегти зміни</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export { EditProductPage };