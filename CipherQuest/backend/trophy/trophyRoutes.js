// backend/trophy/trophyRoutes.js
import express from "express";
import { mintTrophy } from "./mintTrophyService.js";

const router = express.Router();

router.post("/mint", async (req, res) => {
  const { wallet, score } = req.body;

  if (!wallet || score === undefined) {
    return res.status(400).json({ error: "wallet & score required" });
  }

  try {
    const result = await mintTrophy(wallet, score);
    res.json({ success: true, digest: result.digest });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
