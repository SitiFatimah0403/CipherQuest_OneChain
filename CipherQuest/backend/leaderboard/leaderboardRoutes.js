import express from "express";
import { addScore, getScores } from "./leaderboardService.js";

const router = express.Router();

// POST /api/leaderboard/submit
router.post("/submit", (req, res) => {
  const { oneId, wallet, score } = req.body;

  if (!oneId || !wallet || score === undefined) {
    return res.status(400).json({ error: "oneId, wallet, score required" });
  }

  const entry = {
    oneId,
    wallet,
    score,
    timestamp: Date.now()
  };

  const saved = addScore(entry);

  res.json({ success: true, entry: saved });
});

// GET /api/leaderboard/list
router.get("/list", (req, res) => {
  const data = getScores();
  res.json(data);
});

export default router;
