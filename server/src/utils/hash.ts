import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";


const algorithm = 'aes-256-cbc';
const iv = randomBytes(16);

// Encrypt function
export const encrypt = (text: string, keyString: string) => {
  const key = createHash('sha256').update(keyString).digest();
  const cipher = createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return { iv: iv.toString('hex'), encryptedData: encrypted };
};

// Decrypt function
export const decrypt = (encryptedData: string, keyString: string, iv: string) => {
  const key = createHash('sha256').update(keyString).digest();
  const decipher = createDecipheriv(algorithm, key, Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}


