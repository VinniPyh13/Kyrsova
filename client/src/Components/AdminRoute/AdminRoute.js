import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthUser from '../../hooks/useAuthUser';

const AdminRoute = ({ children }) => {
  const user = useAuthUser();

  if (user === null) {
    return <div className='loading-container'>Завантаження...</div>;
  }

  if (!user.roles?.includes('ADMIN')) {
    alert('У вас немає прав аміністратора!');
    return <Navigate to="/" />;
  }

  return children;
};

export { AdminRoute };
