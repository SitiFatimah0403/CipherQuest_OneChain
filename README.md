# 🎮 CipherQuest — Guardians of the Chain
A Web3-enhanced dungeon adventure game built with **Phaser.js and Tiled**, connected to the **OneChain ecosystem** (OneWallet, OneID mimic, OnePlay mimic, and OneChain CLI smart contract).

CipherQuest (inspired by Pac-Man) demonstrates how classic 2D games can integrate blockchain authentication, identity, and achievement systems.

---

## 🌟 Game Overview
CipherQuest is a top-down dungeon crawler where players:

- Navigate a maze-like dungeon  
- Collect coins  
- Solve cipher puzzles  
- Avoid or freeze enemies  
- Teleport via tunnels  
- Manage 3 lives  
- Earn blockchain-linked **OnePlay badges**

---

## 🚀 Key Features

### 🎯 Gameplay
- Smooth WASD / Arrow-key movement  
- Coins (score + win condition)  
- Potions:  
  - Speed boost  
  - Freeze enemies  
- Teleport edges  
- Cipher puzzles that give boosts  
- 3-life heart system  
- Full HUD (score, coins, hearts, title)  
- Win & Game Over scenes  

---

## 🛠 Tech Stack 
- Phaser.js
- JavaScript ES6 Modules
- Node.js + Express
- OneWallet Integration
- OneChain CLI
- Tiled (Map Editor)
- JSON-based local database
- Pinata IPFS

---

## 🔗 OneChain Integration

### 🟢 1. OneWallet
Players connect their **real OneWallet**:
- Authenticates the player  
- Links wallet to OneID  
- Used for badge reward simulation  
- UI overlay in-game  

---

### 🔵 2. OneID Mimic (Local Simulation)
A lightweight mock of OneID:
- Player logs in via local popup  
- OneID stored in `localStorage`  
- Format: `oneid_xxxxxx`  
- Used for linking badges & wallet  

#### 🎯 What OneID Does in CipherQuest

The OneID mimic acts as the player's universal identity, allowing the game to:

- Identify a unique player across sessions
- Link game progress to a consistent account
- Sync badges with the backend (OnePlay mimic)
- Tie together wallet + identity for leaderboard + rewards

#### 🧩 How the OneID Mimic Works

Since real OneID authentication requires production keys, CipherQuest uses a popup-based identity mimic.

👉 Login Flow

1) Player clicks Login with OneID (triggered automatically when submitting score).
2) A small popup simulates an OAuth-like redirect.
3) An access token is generated locally.
4) The game converts it into a unique OneID (example: oneid_yA29.A0ATi)
5) This OneID is saved using localStorage 
```
window.oneIdAddress = "oneid_" + token.slice(0, 10);

```
####  Why OneID Matters (Hackathon POV)

OneID mimic demonstrates:

- ✔ Web3 identity integration
- ✔ Consistent identity across game sessions
- ✔ Coupling identity with achievements
- ✔ Identity + Wallet = Real user profile
- ✔ Supports future expansion: matchmaking, anti-cheat, social, etc.

---

### 🟣 3. OnePlay Mimic — Achievement System
Fully functional mimic of OneChain’s OnePlay achievement service, allowing the game to award badges, store progress, and show a player profile — all without requiring the real OnePlay API.

#### 🎖 Supported Badges:
- `badge_100_coins` — collect 100 coins  
- `badge_puzzle_solver` — solve all puzzles  

#### ⚙️ How the Mimic Works
- 🗂 Stores player achievements in backend/badges.json
- 🔒 Uses safe JSON read/write (atomic writes to prevent corruption)
- 🔑 Identifies users using your OneID mimic (localStorage oneId)
- 👛 Links achievements to connected OneWallet address
- 🔗 Exposes simple REST endpoints:
```
POST /api/oneplay/badge → unlock a badge

GET /api/oneplay/badges/:oneId → fetch player's badges
```

#### ✔ Key Features
- Persistent achievements (survive page reloads)
- Immediate in-game notifications
- Fully local, works offline
- Sandbox-friendly design for hackathons
- Works seamlessly with OneWallet mimic and OneID mock login

---

### 🟠 4. Smart Contract (OneChain CLI)
A simple contract deployed via:
- onechain init
- onechain build
- onechain deploy

Used to demonstrate:
- OneChain dev workflow  
- Reward minting logic (mocked in-game) 

---


## 🖥 5. Backend API

### ⭐ POST `/api/oneplay/badge`
Example of unlocking one of the badge of OnePlay.

**Body:**
```json
{
  "oneId": "oneid_123",
  "badgeId": "badge_puzzle_solver",
  "wallet": "0xABC..."
}

**Response:**
{
  "ok": true,
  "badges": ["badge_puzzle_solver"]
}
```
## 📡 6. OnePlay API Endpoints

### ⭐ GET `/api/oneplay/badges/:oneId`
Returns all unlocked badges for a specific OneID.

*Response Example*
```json
{
  "users": {
    "oneid_123": {
      "wallet": "0x123",
      "badges": ["badge_puzzle_solver"],
      "updatedAt": 17291820129
    }
  }
}
```
## 🎮 7. Core Badge Logic (In-Game)
### ✔ Unlock “100 Coins” Badge
```js
if (this.coinsCollected === 100) {
  this.unlockOnePlayBadge("badge_100_coins");
}
```
### ✔ Unlock “Puzzle Solver” Badge
```js
if (this.puzzleGroup.getChildren().length === 0) {
  this.unlockOnePlayBadge("badge_puzzle_solver");
}
```
## 🔥 8. Running CipherQuest Locally
### 1️⃣ Start Backend (OnePlay API)
- cd CipherQuest\backend
- npm install
- node index.js (run as: http://localhost:5000)

### 2️⃣ Start Frontend (Phaser Game)

You can run the Phaser frontend using **any static server**:

#### ▶ Option A — http-server
```bash
npm i -g http-server
http-server -p 5500 
```
- Only open : 
1) http://127.0.0.1:5500/index.html <br>
or
2) http://localhost:5500/index.html

#### ▶ Option B — VSCode Live Preview
- Right-click index.html → Open with Live Preview

---

### 🧪 9. Testing OnePlay Integration
1) Delete badges.json (reset)
2) Reload the game
3) Login using the OneID mimic
4) Connect your OneWallet
5) Collect 100 coins → 100 Coins Badge popup
6) Solve all puzzles → Puzzle Solver Badge popup
7) Open OnePlay Profile → view unlocked badges

---

### 🏆 10. Hackathon Purpose
CipherQuest demonstrates:
- Hybrid Web2/Web3 gameplay
- Integration with OneWallet, OneID mimic, OnePlay mimic
- Smart contract deployment using OneChain CLI
- A fully working blockchain-enhanced game loop
Built for the OneChain Web3 Hackathon 2025.

---

### 11. Demo Video
[![CipherQuest Demo](https://img.youtube.com/vi/mjv94_hz3sI/0.jpg)](https://youtu.be/mjv94_hz3sI)

