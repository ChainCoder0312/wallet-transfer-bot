import React, { ReactNode, createContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { isValidAddress } from "../utils";

//https://bsc-dataseed.binance.org/
// 'https://bscscan.com/tx/'
export const binanceRpcUrl = "https://bsc-dataseed.binance.org/";//'https://data-seed-prebsc-1-s1.binance.org:8545/';
export const explorerUrl = "https://bscscan.com/tx/";// "https://testnet.bscscan.com/tx/";

const abi = [
  "function decimals() view returns (uint8)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function balanceOf(address a) view returns (uint)"
];

interface ContractInfoType {
  name: string;
  symbol: string;
  decimal: number;
  balance: string;
}

interface RpcContextProps {
  provider: ethers.JsonRpcProvider | null;
  getContract: (address: string) => ethers.Contract | null;
  getContractInfo: (address: string, publicKey?: string, decimals?: number) => Promise<ContractInfoType | null>;
}

export const RpcContext = createContext<RpcContextProps>({
  provider: null,
  getContract: () => null,
  getContractInfo: async () => null
});

export const RpcProvider = ({ children }: { children: ReactNode; }) => {
  const [provider, setProvider] = useState<ethers.JsonRpcProvider | null>(null);

  // Initialize the provider
  const getProvider = async (): Promise<ethers.JsonRpcProvider> => {
    return new ethers.JsonRpcProvider(binanceRpcUrl);
  };

  useEffect(() => {
    getProvider()
      .then((res) => setProvider(res))
      .catch((err) => console.error("Failed to initialize provider:", err));
  }, []);

  // Get contract instance
  const getContract = (address: string): ethers.Contract | null => {
    if (!isValidAddress(address) || !provider) {
      // console.error("Invalid address or provider not initialized.");
      return null;
    }
    try {
      return new ethers.Contract(address, abi, provider);
    } catch (err) {
      // console.error("Failed to create contract instance:", err);
      return null;
    }
  };

  // Get contract info
  const getContractInfo = async (
    address: string,
    publicKey?: string,
    decimals?: number
  ): Promise<ContractInfoType | null> => {

    const contract = getContract(address);
    if (!contract) {
      // console.error("Invalid contract instance.");
      return null;
    }

    try {

      let name, decimal = 18, symbol;
      let balance = '0';

      if (publicKey) {
        balance = ethers.formatUnits(await contract.balanceOf(publicKey), decimals);
      } else {
        name = await contract.name();
        decimal = Number(await contract.decimals());
        symbol = await contract.symbol();
      }

      return { name, decimal, symbol, balance };
    } catch (err) {
      // console.error("Failed to fetch contract info:", err);
      return null;
    }
  };

  return (
    <RpcContext.Provider
      value={{
        provider,
        getContract,
        getContractInfo
      }}
    >
      {children}
    </RpcContext.Provider>
  );
};
