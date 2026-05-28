import { useEffect, useState } from "react";

const useAuthUser = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchUser = async () => {
      try {
        const res = await fetch("/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok) setUser(data);
      } catch (err) {
        console.error("Помилка авторизації:", err);
      }
    };

    fetchUser();
  }, []);

  return user;
};

export default useAuthUser;
