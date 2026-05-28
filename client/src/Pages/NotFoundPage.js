import {Routes, Route, Link } from 'react-router-dom';

const NotFoundPage = () => {
    return (
        <div>
            <h1>Page is not found</h1>;
            <Link to="/">Home</Link>;
        </div>
    )
  };
  
  export {NotFoundPage}; 