import { Router } from "express";
import { onCreateBet, onPlaceBet } from "../controllers/baccarat_s";

const router = Router();

router.post("/create", onCreateBet);
router.post("/bet", onPlaceBet);

export default router;
