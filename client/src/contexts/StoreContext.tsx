import { ReactNode, createContext, useEffect, useState } from "react";
import { getItem } from "../utils/session";
import { getService } from "../utils/request";


interface TokenType {
  name: string;
  symbol: string;
  icon: string;
  decimal: number;
  contract: string;
  isNative?: boolean;
}

interface StoreContextProps {
  loading: boolean;
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  tokens: TokenType[],
  setTokens: React.Dispatch<React.SetStateAction<TokenType[]>>;
}

export const StoreContext = createContext<StoreContextProps>({
  loading: true,
  isLoggedIn: false,
  setIsLoggedIn: () => { },
  tokens: [],
  setTokens: () => { }
});




export const StoreProvider = ({ children }: { children: ReactNode; }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState<TokenType[]>([]);

  const fetchTokens = async () => {
    const { data } = await getService('/token/fetch');
    setTokens(data as TokenType[]);
  };
  // check session
  useEffect(() => {
    if (getItem("access_token")) {
      setIsLoggedIn(true);
      setLoading(false);
    } else {
      setLoading(false);
    }
    setLoading(true);
    fetchTokens().then(() => setLoading(false)).catch(() => setLoading(false));
  }, []);

  return (
    <StoreContext.Provider
      value={{
        loading,
        isLoggedIn,
        setIsLoggedIn,
        tokens,
        setTokens
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};
