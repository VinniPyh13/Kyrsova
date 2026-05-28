import React, { useEffect, useState } from "react";
import BookCard from "./ProductCard";
import "./FavoritesBooks.css";

const FavoritesBooks = ({ books, userId, onbookClick, handleAddToCart }) => {
  const [favoriteBooks, setFavoriteBooks] = useState([]);

  const fetchFavoriteBooks = async () => {
    if (!userId) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/users/${userId}/favorites`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Authorization failed:", errorData.message);
        return;
      }

      const data = await response.json();
      console.log("Fetched favorite books:", data);

      if (Array.isArray(data)) {
        setFavoriteBooks(data);
      } else {
        console.error("Server response is not an array:", data);
      }
    } catch (error) {
      console.error("Error fetching favorite books:", error);
    }
  };

  useEffect(() => {
    fetchFavoriteBooks();
  }, [userId]);

  // Re-fetch favorite books after a favorite is added/removed
  const handleFavoriteChange = () => {
    fetchFavoriteBooks(); // Ensure this uses the defined function in the same scope
  };

  const scrollLeftFav = () => {
    const container = document.querySelector(".fav_books");
    container.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRightFav = () => {
    const container = document.querySelector(".fav_books");
    container.scrollBy({ left: 300, behavior: "smooth" });
  };

  return (
    <section id="favorites">
      <h1 className="zagolovok">Обране</h1>
      <div className="fav_books">
        {favoriteBooks.length > 0 ? (
          favoriteBooks.map((book) => (
            <BookCard
              key={book._id}
              book={book}
              onbookClick={onbookClick}
              onFavoriteChange={handleFavoriteChange}
              handleAddToCart={handleAddToCart}

            />
          ))
        ) : (
          <p className="no-favorites">Жодної книги в "Обраних"</p>
        )}
      </div>

      <button className="scroll_arrow left" onClick={scrollLeftFav}>
        &#60;
      </button>
      <button className="scroll_arrow right" onClick={scrollRightFav}>
        &#62;
      </button>
    </section>
  );
};

export default FavoritesBooks;
