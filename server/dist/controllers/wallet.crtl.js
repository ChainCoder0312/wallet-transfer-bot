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
exports.saveData = exports.fetch = exports.getPrivateKey = void 0;
const file_manage_1 = require("../utils/file_manage");
const hash_1 = require("../utils/hash");
const auth_1 = require("../utils/auth");
const getPrivateKey = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { password, num } = req.body;
        const isMatch = yield (0, auth_1.verifyPassword)(password);
        if (!isMatch)
            return res.status(401).json({ message: 'Invalid Password' });
        const walletData = yield (0, file_manage_1.readData)('wallets');
        if (!walletData)
            return res.json('');
        const datastr = (0, hash_1.decrypt)(walletData.encryptedData, walletData.iv);
        let wallets = JSON.parse(datastr);
        res.json(((_a = wallets[num - 1]) === null || _a === void 0 ? void 0 : _a.privateKey) || '');
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Server errror' });
    }
});
exports.getPrivateKey = getPrivateKey;
const fetch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const walletData = yield (0, file_manage_1.readData)('wallets');
        if (!walletData)
            return res.json([]);
        const datastr = (0, hash_1.decrypt)(walletData.encryptedData, walletData.iv);
        const wallets = JSON.parse(datastr);
        const resData = [
            {
                publicKey: ((_a = wallets[0]) === null || _a === void 0 ? void 0 : _a.publicKey) || ''
            }, {
                publicKey: ((_b = wallets[1]) === null || _b === void 0 ? void 0 : _b.publicKey) || ""
            }
        ];
        res.json(resData);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Server errror' });
    }
});
exports.fetch = fetch;
const saveData = (bot) => (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { wallet, num } = req.body;
        // Ensure wallet is a valid object
        if (!wallet || !num) {
            return res.status(400).json({ message: "Invalid request data" });
        }
        const walletData = yield (0, file_manage_1.readData)("wallets");
        if (!walletData) {
            const initialData = num === 1 ? [wallet] : [undefined, wallet];
            const encryptedData = (0, hash_1.encrypt)(JSON.stringify(initialData));
            yield (0, file_manage_1.writeData)("wallets", encryptedData);
        }
        else {
            const datastr = (0, hash_1.decrypt)(walletData.encryptedData, walletData.iv);
            let wallets = JSON.parse(datastr);
            // Initialize wallets array if undefined or empty
            wallets = wallets || [];
            // Ensure the array has at least 2 slots
            if (!wallets[num - 1])
                wallets[num - 1] = {};
            if (!wallet.privateKey) {
                wallets[num - 1].publicKey = wallet.publicKey;
            }
            else {
                wallets[num - 1] = wallet;
            }
            const encryptedData = (0, hash_1.encrypt)(JSON.stringify(wallets));
            yield (0, file_manage_1.writeData)("wallets", encryptedData);
        }
        if (num === 2)
            bot.updatePublicKey(wallet.publicKey);
        else if (wallet.privateKey)
            bot.updatePrivateKey(wallet.privateKey);
        res.json({ message: "Saved successfully" });
    }
    catch (err) {
        console.error("Error saving data:", err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.saveData = saveData;
