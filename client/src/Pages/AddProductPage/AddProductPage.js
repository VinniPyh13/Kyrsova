import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AddProductPage.css";

const AddProductPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  
  const [allCategories, setAllCategories] = useState([]);
  const [allSubcategories, setAllSubcategories] = useState([]);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    brand: "",
    price: "",
    salePrice: "",
    isSale: false,
    description: "",
    categoryId: "",
    subcategories: [],
    images: [],
    variants: [{ size: "", color: "", quantity: "" }], // Варіації замість старих полів
    material: "",
    gender: "Унісекс",
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setAllCategories(data);
      } catch (err) {
        console.error("Помилка при завантаженні категорій:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === "checkbox" ? checked : value;

    setFormData((prevState) => {
      const updatedFormData = { ...prevState, [name]: finalValue };

      if (name === "categoryId") {
        const selectedCategory = allCategories.find((cat) => cat._id === value);
        const subs = selectedCategory ? selectedCategory.subcategories : [];
        updatedFormData.subcategories = [];
        setAllSubcategories(subs || []);
      }

      return updatedFormData;
    });
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    const maxFiles = 5;
    const totalFiles = formData.images.length + files.length;
    if (totalFiles > maxFiles) {
      alert(`Максимум ${maxFiles} зображень`);
      return;
    }

    setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const handleRemoveImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData((prev) => ({ ...prev, images: newImages }));
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
    setUploading(true);

    try {
      const { images, variants, ...productData } = formData;

      const formattedData = {
        ...productData,
        price: Number(productData.price),
        salePrice: productData.isSale ? Number(productData.salePrice) : null,
        categoryId: [productData.categoryId],
        variants: variants
          .map((v) => ({
            size: v.size.trim(),
            color: v.color.trim(),
            quantity: Number(v.quantity) || 0,
          }))
          .filter((v) => v.size !== "" && v.color !== ""), // Відкидаємо порожні
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formattedData),
      });

      if (!res.ok) throw new Error("Помилка при створенні товару");

      const createdProduct = await res.json();

      if (images.length > 0) {
        const data = new FormData();
        images.forEach((img) => data.append("files", img));
        data.append("productId", createdProduct._id);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: data,
        });

        if (!uploadRes.ok)
          throw new Error("Помилка при завантаженні зображень");
      }

      alert("Товар успішно додано!");
      navigate("/admin");
    } catch (err) {
      console.error("Помилка:", err);
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="add-product-wrapper">
      <div className="add-product-container">
        <div className="header-actions">
          <button type="button" onClick={() => navigate("/admin")} className="btn-back-admin">
            ← Назад до панелі
          </button>
          <h1 className="page-title">Додавання нового товару</h1>
        </div>

        <form onSubmit={handleSubmit} className="add-product-form">
          <div className="form-layout">
            {/* Ліва колонка: Фотографії */}
            <div className="left-column">
              <div className="image-upload-section">
                <h3 className="section-title">Фотографії товару</h3>
                <div className="image-grid">
                  {formData.images.map((img, index) => {
                    const preview = typeof img === "string" ? img : URL.createObjectURL(img);
                    return (
                      <div key={index} className="image-preview-card">
                        <img src={preview} alt={`Preview ${index + 1}`} className="thumbnail" />
                        <button type="button" onClick={() => handleRemoveImage(index)} className="remove-img-btn">×</button>
                      </div>
                    );
                  })}
                  {formData.images.length < 5 && (
                    <div className="upload-box">
                      <input type="file" id="file-upload" multiple accept="image/*" onChange={handleFileUpload} />
                      <label htmlFor="file-upload" className="upload-label">
                        <span className="upload-icon">+</span>
                        <span>Додати фото</span>
                      </label>
                    </div>
                  )}
                </div>
                <p className="upload-hint">Можна завантажити до 5 зображень (JPG, PNG).</p>
              </div>
            </div>

            {/* Права колонка: Деталі товару */}
            <div className="right-column">
              <div className="details-section">
                <h3 className="section-title">Основна інформація</h3>

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
                  <label>Назва товару:</label>
                  <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="Напр., Футболка оверсайз" />
                </div>

                <div className="form-row">
                  <div className="form-group half">
                    <label>Бренд:</label>
                    <input type="text" name="brand" value={formData.brand} onChange={handleChange} placeholder="Напр., Zara" />
                  </div>
                  <div className="form-group half">
                    <label>Базова ціна (грн):</label>
                    <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group half">
                    <label>Стать (Gender):</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className="form-input">
                      <option value="Чоловічий">Чоловічий</option>
                      <option value="Жіночий">Жіночий</option>
                      <option value="Унісекс">Унісекс</option>
                      <option value="Дитячий">Дитячий</option>
                    </select>
                  </div>
                  <div className="form-group half">
                    <label>Матеріал:</label>
                    <input type="text" name="material" value={formData.material} onChange={handleChange} placeholder="Напр., 100% бавовна" />
                  </div>
                </div>

                {/* СЕКЦІЯ ВАРІАЦІЙ */}
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
                          <input type="text" placeholder="Напр., S, M" value={variant.size} onChange={(e) => handleVariantChange(index, "size", e.target.value)} required />
                        </div>
                        <div className="variant-input-group">
                          <label>Колір</label>
                          <input type="text" placeholder="Напр., Чорний" value={variant.color} onChange={(e) => handleVariantChange(index, "color", e.target.value)} required />
                        </div>
                        <div className="variant-input-group quantity-group">
                          <label>К-сть (шт)</label>
                          <input type="number" min="0" value={variant.quantity} onChange={(e) => handleVariantChange(index, "quantity", e.target.value)} required />
                        </div>
                        {formData.variants.length > 1 && (
                          <button type="button" onClick={() => handleRemoveVariant(index)} className="remove-variant-btn" title="Видалити">×</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Опис товару:</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows="5" placeholder="Детальний опис тканини, фасону..." />
                </div>
              </div>

              <div className="categories-section">
                <h3 className="section-title">Категорія каталогу</h3>
                <div className="form-group">
                  <label>Головна категорія:</label>
                  <div className="chip-grid">
                    {allCategories.map((cat) => (
                      <label key={cat._id} className={`chip-radio ${formData.categoryId === cat._id ? "active" : ""}`}>
                        <input type="radio" name="categoryId" value={cat._id} checked={formData.categoryId === cat._id} onChange={handleChange} />
                        <span>{cat.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {allSubcategories.length > 0 && (
                  <div className="form-group">
                    <label>Підкатегорії (можна обрати кілька):</label>
                    <div className="chip-grid">
                      {allSubcategories.map((sub) => (
                        <label key={sub._id} className={`chip-checkbox ${formData.subcategories?.includes(sub._id) ? "active" : ""}`}>
                          <input
                            type="checkbox"
                            value={sub._id}
                            checked={formData.subcategories?.includes(sub._id)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              const value = e.target.value;
                              const updated = checked
                                ? [...formData.subcategories, value]
                                : formData.subcategories.filter((id) => id !== value);
                              setFormData({ ...formData, subcategories: updated });
                            }}
                          />
                          <span>{sub.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-submit" disabled={uploading}>
                  {uploading ? "Збереження..." : "Додати товар"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export { AddProductPage };