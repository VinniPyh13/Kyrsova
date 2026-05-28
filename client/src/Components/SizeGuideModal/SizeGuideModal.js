import React from 'react';
import './SizeGuideModal.css';

const SizeGuideModal = ({ isOpen, onClose, categoryType }) => {
  if (!isOpen) return null;

  // Рендеринг відповідної таблиці залежно від типу категорії
  const renderTable = () => {
    switch (categoryType) {
      case 'shoes': // ВЗУТТЯ
        return (
          <table className="size-table">
            <thead>
              <tr>
                <th>EU (Наш)</th>
                <th>US</th>
                <th>UK</th>
                <th>Довжина стопи (см)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>40</td><td>7</td><td>6.5</td><td>25.5</td></tr>
              <tr><td>41</td><td>8</td><td>7.5</td><td>26.0</td></tr>
              <tr><td>42</td><td>9</td><td>8.5</td><td>27.0</td></tr>
              <tr><td>43</td><td>10</td><td>9.5</td><td>28.0</td></tr>
              <tr><td>44</td><td>11</td><td>10.5</td><td>28.5</td></tr>
            </tbody>
          </table>
        );
      case 'pants': // ШТАНИ / ДЖИНСИ
        return (
          <table className="size-table">
            <thead>
              <tr>
                <th>Розмір</th>
                <th>Обхват талії (см)</th>
                <th>Обхват стегон (см)</th>
                <th>Міжнародний</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>30</td><td>76-78</td><td>94-96</td><td>S</td></tr>
              <tr><td>32</td><td>81-83</td><td>99-101</td><td>M</td></tr>
              <tr><td>34</td><td>86-88</td><td>104-106</td><td>L</td></tr>
              <tr><td>36</td><td>91-93</td><td>109-111</td><td>XL</td></tr>
            </tbody>
          </table>
        );
      default: // ОДЯГ (ВЕРХ: Худі, Футболки, Куртки) за замовчуванням
        return (
          <table className="size-table">
            <thead>
              <tr>
                <th>Міжнародний</th>
                <th>UA (Наш)</th>
                <th>Обхват грудей (см)</th>
                <th>Обхват талії (см)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>S</td><td>46</td><td>92-95</td><td>80-83</td></tr>
              <tr><td>M</td><td>48</td><td>96-99</td><td>84-87</td></tr>
              <tr><td>L</td><td>50</td><td>100-103</td><td>88-91</td></tr>
              <tr><td>XL</td><td>52</td><td>104-107</td><td>92-95</td></tr>
            </tbody>
          </table>
        );
    }
  };

  const getTitle = () => {
    if (categoryType === 'shoes') return 'Розмірна сітка взуття';
    if (categoryType === 'pants') return 'Розмірна сітка штанів та джинсів';
    return 'Розмірна сітка одягу';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="size-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="size-modal-header">
          <h3>{getTitle()}</h3>
          <button className="size-modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="size-modal-body">
          {renderTable()}
        </div>
        <div className="size-modal-footer">
          <p>* Параметри вказані відповідно до стандартних розмірних брендів платформи FashionStore.</p>
        </div>
      </div>
    </div>
  );
};

export default SizeGuideModal;