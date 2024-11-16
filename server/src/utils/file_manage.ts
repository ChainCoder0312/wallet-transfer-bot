import { join } from 'path';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import path = require('path');
const config = require('../../config');


export const writeData = async (filename: string, data: any) => {
  try {
    const filepath = join(config.DIR, 'data', filename);

    // Use JSON.stringify to format the data for storage
    writeFileSync(filepath, JSON.stringify(data, null, 2)); // Adding spacing for readability

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
