import { useContext } from "react";
import { StoreContext } from "../contexts/StoreContext";

export const useStore = () => {
  const contextValue = useContext(StoreContext);
  return contextValue;
};