import { ethers } from "ethers";


const binanceRpcUrl = 'https://bsc-dataseed.binance.org/';
const getProvider = async () => {
  return new ethers.JsonRpcProvider(binanceRpcUrl);
};