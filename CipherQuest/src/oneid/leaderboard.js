import { getOneID, loginWithOneID } from "./oneid.js";

const API = "http://localhost:5000/api/leaderboard";

export async function submitScore(score, walletAddress) {
  try {
    // 1. Always check OneID session
    let oneid = getOneID();

    console.log("🔍 Before login, OneID:", oneid);

    if (!oneid.address) {
      console.warn("⚠️ No OneID session found. Triggering login...");
      oneid = await loginWithOneID();
    }

    // ------------------------------
    // oneID + short wallet hash = unique per player
    // ------------------------------
    const mixedId = `${oneid.oneId}_${walletAddress.slice(2, 10)}`;
    console.log("🟣 Mixed OneID for leaderboard:", mixedId);

    // 2. POST to backend
    console.log("📤 Submitting score with data:", {
      oneId: mixedId,
      score,
      wallet: walletAddress
    });

    const res = await fetch(`${API}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        oneId: mixedId,         // ⬅️ Use mixed identity here
        wallet: walletAddress,
        score
      })
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error("Server error: " + err);
    }

    return await res.json();

  } catch (err) {
    console.error("❌ Submit score failed:", err);
    throw err;
  }
}

// GET leaderboard list
export async function getLeaderboard() {
  try {
    const res = await fetch(`${API}/list`);
    return await res.json();
  } catch (err) {
    console.error("❌ Failed to fetch leaderboard:", err);
    return [];
  }
}
