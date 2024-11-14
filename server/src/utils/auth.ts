import { compare, hash } from "bcryptjs";
import { readData, writeData } from "./file_manage";

async function hashPassword(password: string) {
  const saltRounds = 10;
  return await hash(password, saltRounds);
}

export const savePassword = async (password: string) => {
  try {
    const hashedPassword = await hashPassword(password);
    await writeData('password', hashedPassword);

  } catch (err) {
    throw err;
  }
};

export const verifyPassword = async (password: string) => {
  try {
    const storedHash = await readData('password');
    return await compare(password, storedHash || '');
  } catch (err) {
    throw err;
  }

};