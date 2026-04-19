import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

interface User {
  displayName?: string;
  username: string;
  email: string;
  avatarUrl?: string;
}

const UserContext = createContext<{
  user: User | null;
  setUser: (u: User) => void;
  loading: boolean;
}>({
  user: null,
  setUser: () => {},
  loading: true,
});

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });

        if (!res.ok) throw new Error("Не авторизован");

        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error(err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);