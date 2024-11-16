import { Request, Response } from 'express';
import { readData, writeData } from '../utils/file_manage';
import { decrypt, encrypt } from '../utils/hash';
import { verifyPassword } from '../utils/auth';
import { Bot } from '../bot/bot';
interface Wallet {
  privateKey: string;
  publicKey: string;
}


export const getPrivateKey = async (req: Request, res: Response) => {
  try {
    const { password, num } = req.body;
    const isMatch = await verifyPassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid Password' });

    const walletData = await readData('wallets');
    if (!walletData) return res.json('');

    const datastr = decrypt(walletData.encryptedData, walletData.iv);
    let wallets: Wallet[] = JSON.parse(datastr);
    res.json(wallets[num - 1]?.privateKey || '');

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Server errror' });
  }
};
export const fetch = async (req: Request, res: Response) => {
  try {
    const walletData = await readData('wallets');
    if (!walletData) return res.json([]);

    const datastr = decrypt(walletData.encryptedData, walletData.iv);
    const wallets: Wallet[] = JSON.parse(datastr);
    const resData = [
      {
        publicKey: wallets[0]?.publicKey || ''
      }, {
        publicKey: wallets[1]?.publicKey || ""
      }
    ];

    res.json(resData);


  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Server errror' });
  }
};

export const saveData = (bot: Bot) => async (req: Request, res: Response) => {
  try {
    let { wallet, num }: { wallet: Wallet; num: 1 | 2; } = req.body;

    // Ensure wallet is a valid object
    if (!wallet || !num) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    const walletData = await readData("wallets");

    if (!walletData) {
      const initialData = num === 1 ? [wallet] : [undefined, wallet];
      const encryptedData = encrypt(JSON.stringify(initialData));
      await writeData("wallets", encryptedData);

    } else {
      const datastr = decrypt(walletData.encryptedData, walletData.iv);
      let wallets = JSON.parse(datastr);

      // Initialize wallets array if undefined or empty
      wallets = wallets || [];

      // Ensure the array has at least 2 slots
      if (!wallets[num - 1]) wallets[num - 1] = {};

      if (!wallet.privateKey) {
        wallets[num - 1].publicKey = wallet.publicKey;
      } else {
        wallets[num - 1] = wallet;
      }

      const encryptedData = encrypt(JSON.stringify(wallets));
      await writeData("wallets", encryptedData);
    }
    if (num === 2) bot.updatePublicKey(wallet.publicKey);
    else if (wallet.privateKey) bot.updatePrivateKey(wallet.privateKey);

    res.json({ message: "Saved successfully" });
  } catch (err) {
    console.error("Error saving data:", err);
    res.status(500).json({ message: "Server error" });
  }
};
