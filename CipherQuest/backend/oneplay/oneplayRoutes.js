import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, "badges.json");

// ================================
// 📌 SAFE READ DB
// ================================
function readDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      console.warn("⚠️ DB file missing — creating a new one.");

      const empty = { users: {} };

      // Create file immediately
      fs.writeFile(DB_PATH, JSON.stringify(empty, null, 2), () => {});


      return empty;
    }


    const raw = fs.readFileSync(DB_PATH, "utf8");

    // Prevent empty file crash
    if (!raw || raw.trim().length < 2) {
      console.warn("⚠️ Empty or invalid DB detected — resetting.");
      const empty = { users: {} };
      fs.writeFile(DB_PATH, JSON.stringify(empty, null, 2), () => {});

      return empty;
    }

    return JSON.parse(raw);

  } catch (err) {
    console.error("❌ DB corrupted — auto recovering:", err);
    const empty = { users: {} };
    fs.writeFile(DB_PATH, JSON.stringify(empty, null, 2), () => {});

    return empty;
  }
}

// ================================
// 📌 SAFE WRITE DB (Non-blocking + Atomic)
// ================================
function writeDB(obj) {
  const tempPath = DB_PATH + ".tmp";

  fs.writeFile(
    tempPath,
    JSON.stringify(obj, null, 2),
    (err) => {
      if (err) {
        console.error("❌ Failed to write temp DB:", err);
        return;
      }

      fs.rename(tempPath, DB_PATH, (err) => {
        if (err) {
          console.error("❌ Failed to finalize DB write:", err);
        }
      });
    }
  );
}


// ================================
// 🔥 Normalize OneID
// ================================
function normalizeOneId(id) {
  if (!id) return id;
  // Keep only stable prefix (prevents duplicates)
  return id.split("_")[0];
}

// ================================
// 🔥 Normalize Badge IDs
// ================================
const normalizeBadgeId = (id) => {
  const map = {
    "badge100_popup": "badge_100_coins",
    "badgepuzzle_popup": "badge_puzzle_solver",
    "badge_100_coins": "badge_100_coins",
    "badge_puzzle_solver": "badge_puzzle_solver"
  };
  return map[id] || id;
};


// ================================
// 🚀 UNLOCK BADGE
// ================================
router.post("/badge", (req, res) => {
  let { oneId, wallet, badgeId } = req.body;

  if (!oneId || !badgeId) {
    return res.status(400).json({ ok: false, error: "oneId and badgeId required" });
  }

  oneId = normalizeOneId(oneId);
  badgeId = normalizeBadgeId(badgeId);

  try {
    const db = readDB();

    if (!db.users[oneId]) {
      db.users[oneId] = {
        wallet: wallet || null,
        badges: [],
        updatedAt: Date.now()
      };
    }

    const user = db.users[oneId];

    if (!user.badges.includes(badgeId)) {
      user.badges.push(badgeId);
      user.updatedAt = Date.now();
      if (wallet) user.wallet = wallet;
      writeDB(db);
    }

    res.json({ ok: true, badges: user.badges });

  } catch (err) {
    console.error("OnePlay badge error:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});


// ================================
// 🚀 FETCH BADGES
// ================================
router.get("/badges/:oneId", (req, res) => {
  let { oneId } = req.params;

  oneId = normalizeOneId(oneId);

  try {
    const db = readDB();

    if (!db.users[oneId]) {
      return res.json({
        ok: true,
        badges: [],
        wallet: null
      });
    }

    const user = db.users[oneId];
    const normalized = user.badges.map(normalizeBadgeId);

    res.json({
      ok: true,
      badges: normalized,
      wallet: user.wallet || null,
    });

  } catch (err) {
    console.error("Fetch badge error:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

export default router;
