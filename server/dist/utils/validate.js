"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidAddress = void 0;
const isValidAddress = (address) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
};
exports.isValidAddress = isValidAddress;
