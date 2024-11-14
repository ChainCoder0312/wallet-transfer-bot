import { ReactNode, createContext, useEffect, useState } from "react";
import { getItem } from "../utils/session";

interface AuthContextProps {
  loading: boolean;
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AuthContext = createContext<AuthContextProps>({
  loading: true,
  isLoggedIn: false,
  setIsLoggedIn: () => { },
});

export const AuthProvider = ({ children }: { children: ReactNode; }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // check session
  useEffect(() => {
    if (getItem("access_token")) {
      setIsLoggedIn(true);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        loading,
        isLoggedIn,
        setIsLoggedIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
