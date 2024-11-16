import { useContext } from "react";
import { RpcContext } from "../contexts/RpcContext";

export const useEther = () => {
  const contextValue = useContext(RpcContext);
  return contextValue;
};