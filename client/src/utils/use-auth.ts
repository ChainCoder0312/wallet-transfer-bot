import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

export const useAuth = () => {
  const contextValue = useContext(AuthContext);
  return contextValue;
};