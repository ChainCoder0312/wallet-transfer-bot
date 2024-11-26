"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrypt = exports.encrypt = void 0;
const crypto_1 = require("crypto");
const config = require("../../config");
const algorithm = 'aes-256-cbc';
const iv = (0, crypto_1.randomBytes)(16);
// Encrypt function
const encrypt = (text) => {
    const key = (0, crypto_1.createHash)('sha256').update(config.secritKey).digest();
    const cipher = (0, crypto_1.createCipheriv)(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return { iv: iv.toString('hex'), encryptedData: encrypted };
};
exports.encrypt = encrypt;
// Decrypt function
const decrypt = (encryptedData, iv) => {
    const key = (0, crypto_1.createHash)('sha256').update(config.secritKey).digest();
    const decipher = (0, crypto_1.createDecipheriv)(algorithm, key, Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};
exports.decrypt = decrypt;
