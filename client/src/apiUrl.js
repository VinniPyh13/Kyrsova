// client/src/apiUrl.js
const API_URL = window.location.hostname === "localhost" 
  ? "http://localhost:8000" 
  : "https://duplom-5zpf.onrender.com";

export default API_URL;