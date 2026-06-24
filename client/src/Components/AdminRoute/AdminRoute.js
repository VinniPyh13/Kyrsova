import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthUser from '../../hooks/useAuthUser';
import { showToast } from '../../utils/toast';

const AdminRoute = ({ children }) => {
  const user = useAuthUser();

  if (user === null) {
    return <div className='loading-container'>Завантаження...</div>;
  }

  if (!user.roles?.includes('ADMIN')) {
    sessionStorage.setItem('toast_error', 'У вас немає прав адміністратора!');
    return <Navigate to="/" />;
  }

  return children;
};

export { AdminRoute };
