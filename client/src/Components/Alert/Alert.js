// src/components/Alert/Alert.js
const Alert = ({ message, type = 'success', onClose }) => {
  return (
    <div className={`alert alert-${type}`}>
      <span>{message}</span>
      <button onClick={onClose}>&times;</button>
    </div>
  );
};

export default Alert;
