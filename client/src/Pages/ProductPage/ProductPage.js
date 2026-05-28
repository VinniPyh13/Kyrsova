import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StarRating from "../../Components/StarRating/StarRating.js";
import useAuthUser from "../../hooks/useAuthUser.js";
import SizeGuideModal from "../../Components/SizeGuideModal/SizeGuideModal.js";
import "./ProductPage.css";

const Alert = ({ message, type = "success", onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose && onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible) return null;

  return (
    <div className={`custom-alert ${type}`}>
      <div className="alert-content">
        <span className="alert-message">{message}</span>
        <button className="alert-close" onClick={() => { setVisible(false); onClose && onClose(); }}>&times;</button>
      </div>
    </div>
  );
};

// Приймаємо нові пропси з роутера: isProductFavorite та handleToggleFavorite
const ProductPage = ({ fetchCart, isProductFavorite, handleToggleFavorite }) => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = useAuthUser();
  const navigate = useNavigate();
  
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [isReviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewRating, setReviewRating] = useState(1);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [isSizeModalOpen, setSizeModalOpen] = useState(false);

  // ОПТИМІЗАЦІЯ: Використовуємо глобальну функцію перевірки обраного
  const isFavorite = useMemo(() => {
    if (!product || !isProductFavorite) return false;
    return isProductFavorite(product._id);
  }, [product, isProductFavorite]);

  // Визначення типу розмірної сітки
  const sizeCategoryType = useMemo(() => {
    if (!product) return 'clothing';

    const subcategoriesString = (product.subcategories || []).map(sc => sc.name?.toLowerCase()).join(' ');
    const categoriesString = (Array.isArray(product.categoryId) ? product.categoryId : [product.categoryId])
      .map(c => c?.name?.toLowerCase()).join(' ');

    if (subcategoriesString.includes('взуття') || categoriesString.includes('взуття') || subcategoriesString.includes('кросівки')) {
      return 'shoes';
    }
    if (subcategoriesString.includes('штани') || subcategoriesString.includes('джинси') || subcategoriesString.includes('шорти')) {
      return 'pants';
    }
    return 'clothing'; 
  }, [product]);

  // Розрахунок доступних варіацій товарів
  const { availableSizes, availableColors, selectedVariantQuantity } = useMemo(() => {
    if (!product || !product.variants) return { availableSizes: [], availableColors: [], selectedVariantQuantity: 0 };

    const sizes = [...new Set(product.variants.filter(v => v.quantity > 0).map(v => v.size))];
    const colors = product.variants
      .filter(v => v.size === selectedSize && v.quantity > 0)
      .map(v => v.color);

    const currentVariant = product.variants.find(
      v => v.size === selectedSize && v.color === selectedColor
    );
    const quantity = currentVariant ? currentVariant.quantity : 0;

    return { availableSizes: sizes, availableColors: colors, selectedVariantQuantity: quantity };
  }, [product, selectedSize, selectedColor]);

  // Завантаження даних товару
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error("Помилка завантаження товару");
        const data = await res.json();
        setProduct(data);
        
        if (data.variants && data.variants.length > 0) {
          const availableVariants = data.variants.filter(v => v.quantity > 0);
          if (availableVariants.length > 0) {
            setSelectedSize(prev => prev ? prev : availableVariants[0].size);
            setSelectedColor(prev => prev ? prev : availableVariants[0].color);
          }
        }
      } catch (err) {
        console.error("Помилка при отриманні товару:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Збереження в історію переглядів
  useEffect(() => {
    if (id) {
      let viewed = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
      viewed = viewed.filter(viewedId => viewedId !== id);
      viewed.unshift(id);
      if (viewed.length > 6) {
        viewed = viewed.slice(0, 6);
      }
      localStorage.setItem("recentlyViewed", JSON.stringify(viewed));
    }
  }, [id]);

  // Скидання кольорів при зміні розміру
  useEffect(() => {
    if (selectedSize && availableColors.length > 0 && !availableColors.includes(selectedColor)) {
      setSelectedColor(availableColors[0]);
    }
  }, [selectedSize, availableColors, selectedColor]);

  const addAlert = (message, type = "success") => {
    const newId = Date.now();
    setAlerts((prev) => [...prev, { id: newId, message, type }]);
    return newId;
  };

  const removeAlert = (idToRemove) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== idToRemove));
  };

  // ОНОВЛЕНА ФУНКЦІЯ: Викликає проп з App.js
  const handleToggleFavoriteClick = async () => {
    if (!user) return addAlert("Потрібно увійти для додавання в обране", "error");
    
    try {
      // Смикаємо глобальну функцію, яка оновить єдиний стейт додатка
      await handleToggleFavorite(product._id);
      addAlert(isFavorite ? "Видалено з обраного!" : "Додано в обране!", "success");
    } catch (e) {
      addAlert("Не вдалося оновити список обраного", "error");
    }
  };

  const handleAddToCart = async () => {
    if (!user) return addAlert("Потрібно увійти для додавання в кошик", "error");
    if (!selectedSize || !selectedColor) return addAlert("Будь ласка, оберіть розмір та колір", "error");
    if (selectedVariantQuantity <= 0) return addAlert("Цієї комбінації немає в наявності", "error");

    try {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ productID: product._id, quantity: 1, selectedSize, selectedColor }),
      });
      if (!res.ok) throw new Error("Не вдалося додати товар до кошика");
      
      addAlert("Товар успішно додано до кошика!", "success");
      if (fetchCart) fetchCart();
    } catch (err) {
      addAlert(err.message, "error");
    }
  };

  const handleRatingChange = (newRating) => {
    setReviewRating(newRating);
  };

  const handleSubmitReview = async () => {
    if (!user) return addAlert("Для залишення коментаря потрібно увійти", "error");
    if (!reviewComment.trim()) return addAlert("Будь ласка, заповніть коментар", "error");

    try {
      if (editingReviewId) {
        const res = await fetch(`/api/reviews/${editingReviewId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            userId: user._id,
            comment: reviewComment.trim(),
            rating: reviewRating,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Помилка при оновленні коментаря");

        setProduct((prev) => ({
          ...prev,
          reviews: prev.reviews.map((review) =>
            review._id === editingReviewId ? data : review
          ),
        }));
      } else {
        const res = await fetch("/api/reviews", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            userId: user._id,
            productId: id,
            comment: reviewComment.trim(),
            rating: reviewRating,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Помилка при створенні коментаря");

        const newReview = {
          ...data,
          userId: { _id: user._id, name: user.name },
        };

        setProduct((prev) => ({
          ...prev,
          reviews: [...prev.reviews, newReview],
        }));
      }

      setReviewComment("");
      setReviewRating(1);
      setEditingReviewId(null);
      setReviewModalOpen(false);
      addAlert("Відгук успішно збережено!", "success");
    } catch (err) {
      console.error("Помилка:", err);
      addAlert(err.message || "Сталася помилка", "error");
    }
  };

  const handleEditReview = (review) => {
    if (review.userId._id !== user._id) return;
    setReviewComment(review.comment);
    setReviewRating(review.rating);
    setEditingReviewId(review._id);
    setReviewModalOpen(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Ви впевнені, що хочете видалити цей коментар?")) return;

    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ userId: user._id }),
      });

      if (!res.ok) throw new Error("Помилка при видаленні коментаря");

      setProduct((prev) => ({
        ...prev,
        reviews: prev.reviews.filter((review) => review._id !== reviewId),
      }));
      addAlert("Відгук видалено", "success");
    } catch (err) {
      console.error("Помилка:", err);
      addAlert(err.message || "Сталася помилка при видаленні коментаря", "error");
    }
  };

  const handleImageClick = (index) => setSelectedImageIndex(index);
  const closeModal = () => setSelectedImageIndex(null);

  const goToNextImage = () => {
    if (product.images && selectedImageIndex < product.images.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  const goToPreviousImage = () => {
    if (selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  if (loading) return <div className="loader">Завантаження...</div>;
  if (!product) return <h2>Товар не знайдено</h2>;

  const categoryNames = (Array.isArray(product.categoryId) ? product.categoryId : [product.categoryId])
      .map((c) => c?.name || "")
      .filter(Boolean).join(", ") || "Невідома";

  const subcategoryNames = (product.subcategories || []).map((sc) => sc.name).join(", ") || "Немає";

  const averageRating = product.reviews && product.reviews.length > 0
      ? (product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length).toFixed(1)
      : null;

  return (
    <>
      <div className="alerts-container">
        {alerts.map((alert) => (
          <Alert key={alert.id} message={alert.message} type={alert.type} onClose={() => removeAlert(alert.id)} />
        ))}
      </div>

      <div className="product-page-navigation">
        <button className="back-to-catalog-btn" onClick={() => navigate(-1)}>
          <span>&larr;</span> Повернутися назад
        </button>
      </div>

      <div className="product-page">
        <div className="left-column">
          {product.images && product.images.length > 0 ? (
            <div className="product-images">
              <div className="main-image-container">
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="product-image main-image"
                  onClick={() => handleImageClick(0)}
                />
              </div>
              <div className="image-gallery">
                {product.images.slice(1).map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${product.title} image ${index + 2}`}
                    className="product-image thumbnail"
                    onClick={() => handleImageClick(index + 1)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <img src={"https://via.placeholder.com/400x500"} alt="Placeholder" className="main-image" />
          )}
        </div>

        {selectedImageIndex !== null && (
          <div className="modal-product" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <img src={product.images[selectedImageIndex]} alt="Large view" className="modal-image" />
              <div className="modal-navigation">
                <button className="prev-button" onClick={goToPreviousImage}>&lt;</button>
                <button className="next-button" onClick={goToNextImage}>&gt;</button>
              </div>
            </div>
          </div>
        )}

        <div className="right-column">
          <div className="product-details">
            <div className="product-header">
                <h1>{product.title}</h1>
                {/* Викликаємо наш новий обробник handleToggleFavoriteClick */}
                <button className={`wishlist-icon ${isFavorite ? "active" : ""}`} onClick={handleToggleFavoriteClick}>
                    {isFavorite ? "♥" : "♡"}
                </button>
            </div>
            
            {averageRating && (
              <div className="rating-block">
                <StarRating rating={+averageRating} />
                <span>({averageRating}) • {product.reviews.length} відгуків</span>
              </div>
            )}

            <div className="price-section">
                {product.isSale && product.salePrice ? (
                    <>
                      <span className="price sale-price">{product.salePrice} грн</span>
                      <span className="price old-price">{product.price} грн</span>
                      <span className="badge discount-badge">
                          -{Math.round(((product.price - product.salePrice) / product.price) * 100)}%
                      </span>
                    </>
                ) : (
                    <span className="price regular-price">{product.price} грн</span>
                )}
            </div>

            <p className="product-material"><strong>Бренд:</strong> {product.brand || "Не вказано"}</p>
            <p className="product-gender"><strong>Стать:</strong> {product.gender || "Не вказано"}</p>
            <p className="product-material"><strong>Матеріал:</strong> {product.material || "Не вказано"}</p>
            <div className="meta-categories">
                  <span><strong>Категорія:</strong> {categoryNames}</span>
                  <span><strong>Підкатегорії:</strong> {subcategoryNames}</span>
            </div>

            <div className="variations-container">
                {availableSizes.length > 0 ? (
                    <>
                        <div className="variation-group">
                            <div className="size-header-container">
                              <h4>Розмір: <span className="selected-val">{selectedSize}</span></h4>
                              <button className="size-guide-trigger-btn" onClick={() => setSizeModalOpen(true)}>Таблиця розмірів</button>
                            </div>
                            <div className="options-list">
                                {availableSizes.map(size => (
                                    <button 
                                        key={size}
                                        className={`option-btn ${selectedSize === size ? 'selected' : ''}`}
                                        onClick={() => setSelectedSize(size)}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {availableColors.length > 0 && (
                            <div className="variation-group">
                                <h4>Колір: <span className="selected-val">{selectedColor}</span></h4>
                                <div className="options-list">
                                    {availableColors.map(color => (
                                        <button 
                                            key={color}
                                            className={`option-btn color-btn ${selectedColor === color ? 'selected' : ''}`}
                                            onClick={() => setSelectedColor(color)}
                                        >
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="out-of-stock-alert">Немає в наявності</div>
                )}
            </div>

            <div className="product-actions">
              {selectedVariantQuantity > 0 ? (
                <button className="add-to-cart-primary" onClick={handleAddToCart}>
                  Додати в кошик
                </button>
              ) : (
                <button className="add-to-cart-primary disabled" disabled>
                  Немає цього варіанту
                </button>
              )}
            </div>

            <div className="product-description">
              <h3>Опис</h3>
              <p>{product.description || "Опис відсутній"}</p>
            </div>
          </div>

          <div className="reviews-section">
            <div className="section-header">
              <h3 className="section-title">Відгуки покупців ({product.reviews?.length || 0})</h3>
              <button onClick={() => setReviewModalOpen(true)} className="add-review-btn">
                Написати відгук
              </button>
            </div>

            {product.reviews && product.reviews.length > 0 ? (
              <div className="reviews-list">
                {product.reviews.map((review) => (
                  <div key={review._id} className="review-card">
                    <div className="review-header">
                      <div className="user-info">
                        <div className="user-avatar">{review.userId?.name?.charAt(0) || "U"}</div>
                        <div>
                          <h4 className="user-name">{review.userId?.name || "Анонімний"}</h4>
                          <div className="review-meta">
                            <StarRating rating={review.rating} />
                            <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {user && review.userId._id === user._id && (
                        <div className="review-actions">
                          <button onClick={() => handleEditReview(review)} className="action-btn edit-btn">✎</button>
                          <button onClick={() => handleDeleteReview(review._id)} className="action-btn delete-btn">✖</button>
                        </div>
                      )}
                    </div>
                    <div className="review-content">
                      <p className="review-text">{review.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-reviews">
                <p>Ще ніхто не залишив відгук. Будьте першим!</p>
              </div>
            )}
          </div>

          {isReviewModalOpen && (
            <div className="modal-overlay" onClick={() => setReviewModalOpen(false)}>
              <div className="modal-content_review" onClick={(e) => e.stopPropagation()}>
                <h3>{editingReviewId ? "Редагувати відгук" : "Залишити відгук"}</h3>
                <div className="rating-selector">
                  <label>Оцінка:</label>
                  <div className="stars-container">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className={`star ${star <= reviewRating ? "selected" : ""}`} onClick={() => handleRatingChange(star)}>
                        {star <= reviewRating ? "★" : "☆"}
                      </span>
                    ))}
                  </div>
                </div>
                <textarea
                  placeholder="Розкажіть про свої враження..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                />
                <button className="submit-review-btn" onClick={handleSubmitReview}>
                  {editingReviewId ? "Оновити" : "Надіслати"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <SizeGuideModal 
        isOpen={isSizeModalOpen} 
        onClose={() => setSizeModalOpen(false)} 
        categoryType={sizeCategoryType} 
      />
    </>
  );
};

export { ProductPage };