import { generateSeed, seedHash, combineSeeds } from "./random";
import { Games } from "../models";
import { Request, Response } from "express";

const GAME_ID = "baccarat_s";

type Suit = 'Hearts' | 'Diamonds' | 'Clubs' | 'Spades';
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

interface Card {
    suit: Suit;
    rank: Rank;
}

const suits: Suit[] = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

type Place = 'Player' | 'Banker' | 'Tie' | 'PPair' | 'BPair';

const multipliers = {
    'Player': 1.94,  // 1.94 instead of 2.0
    'Banker': 1.89,  // 1.89 instead of 1.95
    'Tie': 8.74,     // 8.74 instead of 9.0
    'PPair': 11.65,  // 11.65 instead of 12.0
    'BPair': 11.65   // 11.65 instead of 12.0
};


interface Baccarat {
    userId: string,
    gameId: "baccarat_s",
    amount: number,
    profit: number,
    odds: number,
    betting: {
        serverSeed: string,
        clientSeed: string,
        winnerPlace?: Place,
        bets: { [key in Place]?: number };
    },
    status: "BET" | "LOST" | "WIN"
}


const createDeck = (): Card[] => {
    const deck: Card[] = [];
    for (const suit of suits) {
        for (const rank of ranks) {
            deck.push({ suit, rank });
        }
    }
    return deck;
}

const calculateScore = (hand: Card[]): number => {
    const score = hand.reduce((total, card) => {
        if (card.rank === 'A') return total + 1;
        if (['J', 'Q', 'K', '10'].includes(card.rank)) return total;
        return total + parseInt(card.rank, 10);
    }, 0);

    return score % 10;
}

const dealCards = (numberOfCards: number, combinedHash: string, deck: Card[]): Card[] => {
    const hand: Card[] = [];
    let hashIndex = 0;
    for (let i = 0; i < numberOfCards; i++) {
        const randomIndex = parseInt(combinedHash.slice(hashIndex, hashIndex + 8), 16) % deck.length;
        hand.push(deck[randomIndex]);
        deck.splice(randomIndex, 1);
        hashIndex += 8;
    }
    return hand;
}


const shouldPlayerDraw = (playerScore: number): boolean => {
    return playerScore <= 5;
}

const shouldBankerDraw = (bankerScore: number, playerThirdCard: Card | null): boolean => {
    if (bankerScore <= 2) return true;
    if (!playerThirdCard) return false;

    const playerRank = playerThirdCard.rank;
    if (bankerScore === 3 && playerRank !== '8') return true;
    if (bankerScore === 4 && ['2', '3', '4', '5', '6', '7'].includes(playerRank)) return true;
    if (bankerScore === 5 && ['4', '5', '6', '7'].includes(playerRank)) return true;
    if (bankerScore === 6 && ['6', '7'].includes(playerRank)) return true;

    return false;
}

const determineWinner = (playerScore: number, bankerScore: number): Place => {
    if (playerScore > bankerScore) {
        return 'Player';
    } else if (bankerScore > playerScore) {
        return 'Banker';
    } else {
        return 'Tie';
    }
}

export const onCreateBet = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id || "";
    const { clientSeed: _clientSeed } = req.body;
    try {
        const game = await Games.findOne({ status: "BET", userId, gameId: GAME_ID });
        if (game) {
            return res.json({
                status: true,
                gameId: game._id,
                serverHash: seedHash(game.betting.serverSeed),
                clientSeed: game.betting.clientSeed,
            });
        } else {
            const serverSeed: string = generateSeed();
            const clientSeed = _clientSeed || generateSeed();

            try {
                const newGame = new Games<Baccarat>({
                    userId: userId,
                    gameId: GAME_ID,
                    amount: 0,
                    profit: 0,
                    odds: 0,
                    betting: {
                        serverSeed,
                        clientSeed,
                        bets: {}
                    },
                    status: "BET"
                });
                await newGame.save();

                return res.json({
                    status: true,
                    gameId: newGame._id,
                    serverHash: seedHash(serverSeed),
                    clientSeed,
                });
            } catch (error) {
                console.log(error);
                return res.status(400).json({ status: false });
            }
        }
    } catch (error: any) {
        return res.status(400).json({ status: false, msg: error?.message });
    }
};


export const onPlaceBet = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id || "";
    const { currency, bets }: any = req.body;
    try {
        function isNumber(value: unknown): value is number {
            return typeof value === "number";
        }
        if (Object.values(bets).some(amount => !isNumber(amount) || amount <= 0)) {
            return res.status(400).json({ status: false, msg: "Invalid bet amount" });
        }
        const game = await Games.findOne({ status: "BET", userId, gameId: GAME_ID });
        if (game) {
            let pAmount: number = 0;
            if (!isNaN(bets["Player"]))
                pAmount = Number(bets["Player"] || 0);
            let bAmount: number = 0;
            if (!isNaN(bets["Banker"]))
                bAmount = bets["Banker"] || 0;
            let tAmount: number = 0;
            if (!isNaN(bets["Tie"]))
                tAmount = bets["Tie"] || 0;
            let totalAmount = pAmount + bAmount + tAmount;
            handleBlance(userId, currency, -totalAmount, "BET");

            game.amount = totalAmount;
            game.currency = currency;
            game.profit = -totalAmount;

            const deck = createDeck();
            const combinedhash = combineSeeds(game.betting.serverSeed, game.betting.clientSeed);
            const playerHand = dealCards(2, combinedhash, deck);
            const bankerHand = dealCards(2, combinedhash, deck);
            let playerScore = calculateScore(playerHand);
            let bankerScore = calculateScore(bankerHand);

            let playerThirdCard: Card | null = null;
            if (shouldPlayerDraw(playerScore)) {
                playerThirdCard = dealCards(1, combinedhash, deck)[0];
                playerHand.push(playerThirdCard);
            }

            if (shouldBankerDraw(bankerScore, playerThirdCard)) {
                let bankerThirdCard: Card | null = null;
                bankerThirdCard = dealCards(1, combinedhash, deck)[0];
                bankerHand.push(bankerThirdCard);
            }

            playerScore = calculateScore(playerHand);
            bankerScore = calculateScore(bankerHand);
            let winner = determineWinner(playerScore, bankerScore);
            let winAmount = 0;
            if (winner === "Player") {
                winAmount = pAmount * multipliers[winner];
            } else if (winner === "Banker") {
                winAmount = bAmount * multipliers[winner];
            } else if (winner === "Tie") {
                winAmount = tAmount * multipliers[winner];
            }
            let multiplier = 0;
            if (winAmount > totalAmount) {
                multiplier = Math.round((winAmount / totalAmount) * 100) / 100;
            }
            game.odds = multiplier;
            game.profit = winAmount - totalAmount;
            game.status = winAmount > totalAmount ? "WIN" : "LOST";
            if (winAmount > 0) {
                handleBlance(userId, currency, winAmount, "settlement");
            }
            await Games.findByIdAndUpdate(game._id, {
                odds: game.odds,
                profit: game.profit,
                status: game.status,
                "betting.bets": bets,
                "betting.winnerPlace": winner
            });
            return res.json({
                status: game.status,
                profit: game.profit,
                multiplier: game.odds,
                serverSeed: game.betting.serverSeed,
                clientSeed: game.betting.clientSeed,
                playerHand,
                bankerHand
            });
        } else {
            return res.json({
                status: false,
                msg: "Game not found"
            })
        }
    } catch (error: any) {
        return res.status(400).json({ status: false, msg: error?.message });
    }
}


const handleBlance = (userId: string, currency: string, amount: number, type: string) => {
    console.log(`${type}: ${amount} ${currency} for user ${userId}`);
}
