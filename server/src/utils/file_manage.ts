import { join } from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';


export const writeData = async (filename: string, data: any) => {
  try {

    const filepath = join(__dirname, '../', 'data', filename);
    writeFileSync(filepath, JSON.stringify(data));

  } catch (err) {
    console.log(err);
    throw err;
  }
};
export const readData = async (filename: string) => {
  try {
    const filepath = join(__dirname, '../', 'data', filename);
    const exist = existsSync(filepath);
    let data;
    if (exist) {
      data = readFileSync(filepath, 'utf-8');
    }
    return JSON.parse(data as string);
  } catch (err) {
    console.log(err);
    throw err;
  }
}

