"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bot = void 0;
const ethers_1 = require("ethers");
const file_manage_1 = require("../utils/file_manage");
const hash_1 = require("../utils/hash");
const validate_1 = require("../utils/validate");
require("dotenv").config();
const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "event Transfer(address indexed from, address indexed to, uint256 value)"
];
const RPC_URL = process.env.RPC_URL;
const provider = new ethers_1.ethers.JsonRpcProvider(RPC_URL); // Create an Ethereum JSON RPC provider to interact with the network
const BNB_THRESHOLD = ethers_1.ethers.parseEther("0.001"); // Reserve 0.0001 BNB to ensure the wallet does not get drained
var serverStatus;
(function (serverStatus) {
    serverStatus[serverStatus["RUNNING"] = 0] = "RUNNING";
    serverStatus[serverStatus["STOPPED"] = 1] = "STOPPED";
})(serverStatus || (serverStatus = {}));
;
class Bot {
    // Method to add tasks to a queue to avoid multiple tasks running concurrently
    addToQueue(task) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isQueueRunning)
                return; // Skip if a task is already running
            this.isQueueRunning = true;
            try {
                yield task(); // Run the task
            }
            finally {
                this.isQueueRunning = false; // Reset flag once task is completed
            }
        });
    }
    // Retry logic for handling tasks that might fail (with retries and a delay between attempts)
    retry(task_1) {
        return __awaiter(this, arguments, void 0, function* (task, retries = 3, delay = 3000) {
            for (let i = 0; i < retries; i++) {
                try {
                    yield task(); // Attempt the task
                    return; // Exit retry loop if task succeeds
                }
                catch (error) {
                    console.error(`Attempt ${i + 1} failed:`, error);
                    if (i < retries - 1)
                        yield new Promise((res) => setTimeout(res, delay)); // Wait before retrying
                }
            }
            console.error("All retries failed.");
        });
    }
    // Method to transfer tokens to the public key address (could be ERC20 tokens)
    transferTokens(tokenAddress, tokenName, decimals) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.status === serverStatus.STOPPED)
                return;
            yield this.retry(() => __awaiter(this, void 0, void 0, function* () {
                if (this.inProcessing.has(tokenAddress)) {
                    console.log("this wall inprocessing");
                    return;
                }
                ; // Skip if already processing this token
                this.inProcessing.add(tokenAddress); // Add token address to the processing set
                try {
                    if (!this.wallet || this.wallet.address === this.publicKey || !(0, validate_1.isValidAddress)(this.publicKey)) {
                        console.log("incorrect wallet");
                        this.inProcessing.delete(tokenAddress);
                        return;
                    } // Ensure wallet is available before proceeding
                    const walletAddress = this.wallet.address;
                    const tokenContract = new ethers_1.ethers.Contract(tokenAddress, ERC20_ABI, this.wallet); // Initialize contract
                    const balance = yield tokenContract.balanceOf(this.wallet.address); // Get token balance
                    if (balance > 0) { // If balance is greater than 0, attempt to transfer tokens
                        console.log(`Transferring ${ethers_1.ethers.formatUnits(balance, decimals)} ${tokenName}...`);
                        const tx = yield tokenContract.transfer(this.publicKey, balance); // Transfer tokens to public key
                        console.log(`Transaction sent: ${tx.hash}`);
                        const delay = () => __awaiter(this, void 0, void 0, function* () {
                            yield tx.wait(); // Wait for the transaction to be confirmed
                            console.log(`${tokenName} transferred successfully in transaction: ${tx.hash}`);
                            this.saveLog(walletAddress, this.publicKey, ethers_1.ethers.formatUnits(balance, decimals), tx.hash, tokenName);
                            if (this.io)
                                this.io.emit('update_balance');
                        });
                        setTimeout(() => delay(), 1000);
                    }
                    else {
                        console.log(`No ${tokenName} balance to transfer.`);
                    }
                }
                catch (error) {
                    console.error(`Error during ${tokenName} transfer:  insufficient gas fee `);
                }
                finally {
                    this.inProcessing.delete(tokenAddress); // Ensure we always clear the processing state for this token
                }
            }));
        });
    }
    // Method to transfer BNB (Ether) to the public key
    transferBNB() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.wallet || this.wallet.address === this.publicKey || !(0, validate_1.isValidAddress)(this.publicKey))
                    return; // Ensure wallet is available
                const walletAddress = this.wallet.address;
                const balance = yield provider.getBalance(walletAddress); // Get current BNB balance
                if (balance > BNB_THRESHOLD) { // Only transfer if balance exceeds the threshold
                    if (this.io) {
                        this.io.emit('update_balance');
                    }
                    if (this.status === serverStatus.STOPPED)
                        return;
                    const amountToSend = balance - BNB_THRESHOLD; // Amount to transfer (subtract the reserve)
                    console.log(`Transferring ${ethers_1.ethers.formatEther(amountToSend)} BNB to ${this.publicKey}...`);
                    const tx = yield this.wallet.sendTransaction({
                        to: this.publicKey, // Destination address
                        value: amountToSend, // Amount to send
                    });
                    console.log(`Transaction sent: ${tx.hash}`);
                    const delay = () => __awaiter(this, void 0, void 0, function* () {
                        yield tx.wait(); // Wait for confirmation
                        console.log(`BNB transferred successfully in transaction: ${tx.hash}\n\n`);
                        this.saveLog(walletAddress, this.publicKey, ethers_1.ethers.formatEther(amountToSend), tx.hash, 'BNB');
                        if (this.io)
                            this.io.emit('update_balance');
                    });
                    setTimeout(() => delay(), 1000);
                }
            }
            catch (error) {
                console.error("Error in BNB transfer:", error);
            }
        });
    }
    // Method to monitor both BNB and ERC20 token deposits
    monitorDeposits() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Monitoring deposits...");
            // Monitor BNB deposits (by watching the blockchain's block events)
            provider.on("block", this.onNativeMonitor);
            // Monitor ERC20 token deposits (by listening for Transfer events)
            this.TOKENS.forEach((token) => {
                var _a;
                (_a = token.contract) === null || _a === void 0 ? void 0 : _a.on("Transfer", (from, to, value) => this.handleTransfer(from, to, value, token));
            });
        });
    }
    // Method to trigger the transfer of all tokens and BNB (could be scheduled or immediate)
    transfer() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                for (let token of this.TOKENS) {
                    yield this.addToQueue(() => this.transferTokens(token.address, token.name, token.decimal)); // Transfer each token
                }
                yield this.addToQueue(() => this.transferBNB()); // Transfer BNB if conditions are met
            }
            catch (err) {
            }
        });
    }
    saveLog(from, to, amount, hash, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const { files } = yield (0, file_manage_1.readDir)();
            let dataToSave = [{
                    from, to, amount, hash, name, time: Date.now(),
                }];
            if (!files) {
                //new file
                yield (0, file_manage_1.writeData)(`log/${Date.now()}`, dataToSave);
            }
            else {
                //append file
                let existData = (yield (0, file_manage_1.readData)(`log/${files[0]}`)) || [];
                if (existData.length < 100) {
                    existData = [{
                            from, to, name, amount, hash, time: Date.now()
                        }, ...existData];
                    yield (0, file_manage_1.writeData)(`log/${files[0]}`, existData);
                }
                else {
                    //new file
                    yield (0, file_manage_1.writeData)(`log/${Date.now()}`, dataToSave);
                }
            }
            if (this.io) {
                this.io.emit('new_transaction', dataToSave[0]);
            }
        });
    }
    // Method to set up the Socket.io server for communication (e.g., frontend updates or notifications)
    onServer(server) {
        this.io = server;
    }
    // Method to update the private key and initialize the wallet
    updatePrivateKey(key) {
        if (!key)
            return;
        console.log('private key updated');
        this.wallet = new ethers_1.ethers.Wallet(key, provider); // Set the wallet using the private key
        this.transfer();
    }
    updatePublicKey(key) {
        console.log('public key updated');
        this.publicKey = key; // Set the wallet using the private key
        this.transfer();
    }
    // Method to add a new ERC20 token to the monitoring list
    addToken(token) {
        const contract = new ethers_1.ethers.Contract(token.address, ERC20_ABI, provider);
        contract === null || contract === void 0 ? void 0 : contract.on("Transfer", (from, to, value) => this.handleTransfer(from, to, value, token));
        this.TOKENS.push(Object.assign(Object.assign({}, token), { contract })); // Add token to list
    }
    // Start the bot and begin monitoring for deposits and transfers
    start() {
        this.status = serverStatus.RUNNING;
        this.transfer();
    }
    stop() {
        this.status = serverStatus.STOPPED;
    }
    // Method to initialize the bot by reading wallet and token data
    initBot() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const walletData = yield (0, file_manage_1.readData)('wallets');
                if (!walletData)
                    return;
                console.log("-----------------------------> init bot");
                const datastr = (0, hash_1.decrypt)(walletData.encryptedData, walletData.iv); // Decrypt wallet data
                const wallets = JSON.parse(datastr); // Parse wallet data
                const tokens = ((yield (0, file_manage_1.readData)('tokens')) || []); // Read list of ERC20 tokens
                this.TOKENS = tokens.filter((tk) => !tk.isNative).map((tk) => ({
                    name: tk.name,
                    address: tk.contract,
                    decimal: tk.decimal,
                    contract: new ethers_1.ethers.Contract(tk.contract, ERC20_ABI, provider)
                })); // Filter out native tokens
                this.updatePrivateKey(((_a = wallets[0]) === null || _a === void 0 ? void 0 : _a.privateKey) || ''); // Set the private key (to access the wallet)
                this.publicKey = ((_b = wallets[1]) === null || _b === void 0 ? void 0 : _b.publicKey) || ''; // Set the public key (address to send tokens to)
            }
            catch (err) {
                console.log(err.message); // Log errors during bot initialization
            }
        });
    }
    // Constructor to initialize the bot (initializing the wallet and tokens)
    constructor() {
        this.wallet = null; // Private key for the wallet, set later
        this.TOKENS = []; // List of ERC20 tokens to monitor
        this.isQueueRunning = false; // Flag to track if tasks are currently running
        this.inProcessing = new Set(); // Set to track which tokens are currently being processed to avoid double transfers
        this.publicKey = ''; // Public key address for sending/receiving transactions
        this.io = null; // Socket.io server instance to interact with the frontend or other services
        this.timer = null;
        this.status = serverStatus.STOPPED;
        this.handleTransfer = (from, to, value, token) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.wallet)
                    return; // Ensure wallet is available
                if (to.toLowerCase() === this.wallet.address.toLowerCase()) { // If the token was sent to the bot's wallet
                    if (this.io)
                        this.io.emit('update_balance');
                    console.log(`Detected deposit of ${ethers_1.ethers.formatUnits(value, 18)} ${token.name}.`);
                    yield this.addToQueue(() => this.transferTokens(token.address, token.name, token.decimal)); // Transfer tokens to public address
                }
            }
            catch (error) {
                console.error(`Error in ${token.name} deposit monitoring:`, error);
            }
        });
        this.onNativeMonitor = () => __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.addToQueue(() => this.transferBNB()); // Check for BNB deposits on every new block
            }
            catch (error) {
                console.error("Error in BNB monitoring:", error);
            }
        });
        this.initBot().then(() => {
            console.log("Starting transfer bot...");
            this.monitorDeposits(); // Start monitoring for token and BNB deposits
            this.timer = setInterval(() => {
                if (!this.isQueueRunning) {
                    this.transfer(); // Run the transfer method at regular intervals
                }
            }, 30000); // Check every 30 seconds
            this.transfer();
            this.status = serverStatus.RUNNING;
        }).catch(() => {
        });
    }
}
exports.Bot = Bot;
