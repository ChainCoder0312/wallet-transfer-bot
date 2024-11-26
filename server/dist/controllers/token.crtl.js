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
exports.fetch = exports.add = void 0;
const file_manage_1 = require("../utils/file_manage");
const add = (bot) => (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, contract, icon = '', decimal = 0, symbol } = req.body;
        let tokens = (yield (0, file_manage_1.readData)('tokens')) || [];
        if (tokens.length) {
            const exist = tokens.filter((v) => v.symbol === symbol || v.contract === contract);
            if (exist.length)
                return res.status(401).json({ message: 'Token already exist' });
            tokens.push({
                name, contract, icon, decimal, symbol
            });
        }
        else {
            tokens = [{
                    name, contract, icon, decimal, symbol
                }];
        }
        yield (0, file_manage_1.writeData)('tokens', tokens);
        bot.addToken({ name, address: contract, decimal });
        res.json({ message: 'Saved successfully' });
    }
    catch (err) {
        res.status(500).json({ message: 'Server errror' });
    }
});
exports.add = add;
const fetch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tokens = yield (0, file_manage_1.readData)('tokens');
        if (tokens.length)
            res.json(tokens);
        else
            res.json([]);
    }
    catch (err) {
        res.status(500).json({ message: 'Server errror' });
    }
});
exports.fetch = fetch;
