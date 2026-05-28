import React from 'react';
import './StarRating.css';

const StarRating = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;
  const totalStars = 5;

  return (
    <span className="star-rating">
      {'★'.repeat(fullStars)}
      {hasHalfStar ? '⯨' : ''}
      {'☆'.repeat(totalStars - fullStars - (hasHalfStar ? 1 : 0))}
    </span>
  );
};

export default StarRating;
