import { Request, Response } from 'express';
import { readData, writeData } from '../utils/file_manage';
import { Bot } from '../bot/bot';


export const add = (bot: Bot) => async (req: Request, res: Response) => {
  try {
    const { name, contract, icon = '', decimal = 0, symbol } = req.body;

    let tokens = await readData('tokens') || [];

    if (tokens.length) {

      const exist = tokens.filter((v: any) => v.symbol === symbol || v.contract === contract);

      if (exist.length) return res.status(401).json({ message: 'Token already exist' });

      tokens.push({
        name, contract, icon, decimal, symbol
      });
    } else {
      tokens = [{
        name, contract, icon, decimal, symbol
      }];
    }
    await writeData('tokens', tokens);
    bot.addToken({ name, address: contract, decimal });



    res.json({ message: 'Saved successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server errror' });
  }
};

export const fetch = async (req: Request, res: Response) => {
  try {
    const tokens = await readData('tokens');
    if (tokens.length) res.json(tokens);
    else res.json([]);
  } catch (err) {
    res.status(500).json({ message: 'Server errror' });
  }
};