import { Server } from 'socket.io';
import { ethers } from "ethers";
import { readData, readDir, writeData } from '../utils/file_manage';
import { decrypt } from '../utils/hash';
import path = require('path');
require("dotenv").config();

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];
const RPC_URL = process.env.RPC_URL;
const provider = new ethers.JsonRpcProvider(RPC_URL); // Create an Ethereum JSON RPC provider to interact with the network
const BNB_THRESHOLD = ethers.parseEther("0.05"); // Reserve 0.1 BNB to ensure the wallet does not get drained

interface Token {
  name: string;
  address: string;
  decimal: number;
}

function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}
const seret_key = 'your_secret_key';

export class Bot {
  private wallet: ethers.Wallet | null = null; // Private key for the wallet, set later
  private TOKENS: Token[] = []; // List of ERC20 tokens to monitor
  private isQueueRunning: boolean = false; // Flag to track if tasks are currently running
  private inProcessing: Set<string> = new Set(); // Set to track which tokens are currently being processed to avoid double transfers
  public publicKey: string = ''; // Public key address for sending/receiving transactions
  public io: Server | null = null; // Socket.io server instance to interact with the frontend or other services

  // Method to add tasks to a queue to avoid multiple tasks running concurrently
  private async addToQueue(task: () => Promise<void>) {
    if (this.isQueueRunning) return; // Skip if a task is already running
    this.isQueueRunning = true;
    try {
      await task(); // Run the task
    } finally {
      this.isQueueRunning = false; // Reset flag once task is completed
    }
  }

  // Retry logic for handling tasks that might fail (with retries and a delay between attempts)
  private async retry(task: () => Promise<void>, retries = 3, delay = 3000) {
    for (let i = 0; i < retries; i++) {
      try {
        await task(); // Attempt the task
        return; // Exit retry loop if task succeeds
      } catch (error) {
        console.error(`Attempt ${i + 1} failed:`, error);
        if (i < retries - 1) await new Promise((res) => setTimeout(res, delay)); // Wait before retrying
      }
    }
    console.error("All retries failed.");
  }

  // Method to transfer tokens to the public key address (could be ERC20 tokens)
  private async transferTokens(tokenAddress: string, tokenName: string, decimals: number) {
    await this.retry(async () => {
      if (this.inProcessing.has(tokenAddress)) return; // Skip if already processing this token

      this.inProcessing.add(tokenAddress); // Add token address to the processing set
      try {
        if (!this.wallet || this.wallet.address === this.publicKey || !isValidAddress(this.publicKey)) {
          this.inProcessing.delete(tokenAddress);
          return;
        } // Ensure wallet is available before proceeding
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, this.wallet); // Initialize contract
        const balance = await tokenContract.balanceOf(this.wallet.address); // Get token balance

        if (balance > 0) { // If balance is greater than 0, attempt to transfer tokens
          console.log(`Transferring ${ethers.formatUnits(balance, decimals)} ${tokenName}...`);
          const tx = await tokenContract.transfer(this.publicKey, balance); // Transfer tokens to public key
          console.log(`Transaction sent: ${tx.hash}`);
          await tx.wait(); // Wait for the transaction to be confirmed
          console.log(`${tokenName} transferred successfully in transaction: ${tx.hash}`);
          this.saveLog(this.wallet.address, this.publicKey, ethers.formatUnits(balance, decimals), tx.hash, tokenName);
        } else {
          console.log(`No ${tokenName} balance to transfer.`);
        }
      } catch (error) {
        console.error(`Error during ${tokenName} transfer:`, error);
      } finally {
        this.inProcessing.delete(tokenAddress); // Ensure we always clear the processing state for this token
      }
    });
  }

  // Method to transfer BNB (Ether) to the public key
  private async transferBNB() {
    try {
      if (!this.wallet || this.wallet.address === this.publicKey || !isValidAddress(this.publicKey)) return; // Ensure wallet is available
      const balance = await provider.getBalance(this.wallet.address); // Get current BNB balance
      if (balance > BNB_THRESHOLD) { // Only transfer if balance exceeds the threshold
        const amountToSend = balance - BNB_THRESHOLD; // Amount to transfer (subtract the reserve)
        console.log(`Transferring ${ethers.formatEther(amountToSend)} BNB to ${this.publicKey}...`);
        const tx = await this.wallet.sendTransaction({
          to: this.publicKey, // Destination address
          value: amountToSend, // Amount to send
        });
        console.log(`Transaction sent: ${tx.hash}`);
        await tx.wait(); // Wait for confirmation
        console.log(`BNB transferred successfully in transaction: ${tx.hash}\n\n`);
        this.saveLog(this.wallet.address, this.publicKey, ethers.formatEther(amountToSend), tx.hash, 'BNB');
      }
    } catch (error) {
      console.error("Error in BNB transfer:", error);
    }
  }

  // Method to monitor both BNB and ERC20 token deposits
  private async monitorDeposits() {
    console.log("Monitoring deposits...");

    // Monitor BNB deposits (by watching the blockchain's block events)
    provider.on("block", async () => {
      try {
        await this.addToQueue(() => this.transferBNB()); // Check for BNB deposits on every new block
      } catch (error) {
        console.error("Error in BNB monitoring:", error);
      }
    });

    // Monitor ERC20 token deposits (by listening for Transfer events)
    this.TOKENS.forEach((token) => {
      const tokenContract = new ethers.Contract(token.address, ERC20_ABI, provider);
      tokenContract.on("Transfer", async (from: any, to: any, value: any) => {
        try {
          if (!this.wallet) return; // Ensure wallet is available
          if (to.toLowerCase() === this.wallet.address.toLowerCase()) { // If the token was sent to the bot's wallet
            console.log(`Detected deposit of ${ethers.formatUnits(value, 18)} ${token.name}.`);
            await this.addToQueue(() => this.transferTokens(token.address, token.name, token.decimal)); // Transfer tokens to public address
          }
        } catch (error) {
          console.error(`Error in ${token.name} deposit monitoring:`, error);
        }
      });
    });
  }

  // Method to trigger the transfer of all tokens and BNB (could be scheduled or immediate)
  private async transfer() {
    for (let token of this.TOKENS) {
      await this.addToQueue(() => this.transferTokens(token.address, token.name, token.decimal)); // Transfer each token
    }
    await this.addToQueue(() => this.transferBNB()); // Transfer BNB if conditions are met
  }

  private async saveLog(from: string, to: string, amount: string, hash: string, name: string) {
    const { files } = await readDir();
    let dataToSave = [{
      from, to, amount, hash, name, time: Date.now(),
    }];
    if (!files) {
      //new file

      await writeData(`log/${Date.now()}`, dataToSave);
    } else {
      //append file
      let existData = (await readData(`log/${files[0]}`)) || [];
      if (existData.length < 100) {
        existData = [{
          from, to, name, amount, hash, time: Date.now()
        }, ...existData];
        await writeData(`log/${files[0]}`, existData);
      } else {
        //new file

        await writeData(`log/${Date.now()}`, dataToSave);
      }
    }

    if (this.io) {
      this.io.emit('new_transaction', dataToSave[0]);
    }

  }

  // Method to set up the Socket.io server for communication (e.g., frontend updates or notifications)
  public onServer(server: Server | null) {
    this.io = server;
  }

  // Method to update the private key and initialize the wallet
  public updatePrivateKey(key: string) {
    console.log('private key updated');
    this.wallet = new ethers.Wallet(key, provider); // Set the wallet using the private key
    this.transfer();
  }
  public updatePublicKey(key: string) {
    console.log('public key updated');
    this.publicKey = key; // Set the wallet using the private key
    this.transfer();
  }

  // Method to add a new ERC20 token to the monitoring list
  public addToken(token: Token) {
    this.TOKENS.push(token); // Add token to list
  }

  // Start the bot and begin monitoring for deposits and transfers
  public start() {
    console.log("Starting transfer bot...");
    this.monitorDeposits(); // Start monitoring for token and BNB deposits
    setInterval(() => {
      if (!this.isQueueRunning) {
        this.transfer(); // Run the transfer method at regular intervals
      }
    }, 30000); // Check every 30 seconds
    this.transfer();
  }
  public restart() {
  }
  public stop() {

  }

  // Method to initialize the bot by reading wallet and token data
  public async initBot() {
    try {
      const walletData = await readData('wallets');
      if (!walletData) return;

      const datastr = decrypt(walletData.encryptedData, seret_key, walletData.iv); // Decrypt wallet data
      const wallets = JSON.parse(datastr); // Parse wallet data
      const tokens = (await readData('tokens') || []); // Read list of ERC20 tokens
      this.TOKENS = tokens.filter((tk: any) => !tk.isNative).map((tk: any) => ({ name: tk.name, address: tk.contract, decimal: tk.decimal })); // Filter out native tokens
      this.updatePrivateKey(wallets[0]?.privateKey || ''); // Set the private key (to access the wallet)
      this.publicKey = wallets[1]?.publicKey || ''; // Set the public key (address to send tokens to)
    } catch (err: any) {
      console.log(err.message); // Log errors during bot initialization
    }
  }

  // Constructor to initialize the bot (initializing the wallet and tokens)
  constructor() {
    this.initBot().then(() => {
      this.start(); // Uncomment to start bot automatically after initialization
    });
  }
}
