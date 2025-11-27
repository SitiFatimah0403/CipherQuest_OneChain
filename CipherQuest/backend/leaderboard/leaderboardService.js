import fs from "fs";
import path from "path";

const filePath = path.resolve("./leaderboard.json");

// Ensure file exists
if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, "[]");
}

export function addScore(entry) {
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

  data.push(entry);

  // Sort highest → lowest
  data.sort((a, b) => b.score - a.score);

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  return entry;
}

export function getScores() {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}
