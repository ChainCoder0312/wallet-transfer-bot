import { useContext } from "react";
import { SocketContext } from "../contexts/SocketContext";

export const useSocket = () => {
  const contextValue = useContext(SocketContext);
  return contextValue;
};