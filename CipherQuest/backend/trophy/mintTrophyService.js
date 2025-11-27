// backend/trophy/mintTrophyService.js
import dotenv from "dotenv";
dotenv.config();

import { SuiClient } from "@onelabs/sui/client";
import { Transaction } from "@onelabs/sui/transactions";
import { Ed25519Keypair } from "@onelabs/sui/keypairs/ed25519";

// env variables PROVIDED by index.js
const PRIVATE_KEY = process.env.ONECHAIN_PRIVATE_KEY;
const PACKAGE_ID  = process.env.PACKAGE_ID;
const RPC = "https://rpc-testnet.onelabs.cc:443";

// 32-byte Ed25519 secret key (correct)
const raw = PRIVATE_KEY.replace("0x", "");
const keypair = Ed25519Keypair.fromSecretKey(Buffer.from(raw, "hex"));

const client = new SuiClient({ url: RPC });

console.log("Backend signer address:", keypair.getPublicKey().toSuiAddress());

export async function mintTrophy(wallet, score) {
  try {
    console.log("🏆 Minting trophy for:", wallet, "Score:", score);

    const tx = new Transaction();

    tx.moveCall({
      target: `${PACKAGE_ID}::trophy::mint_trophy`,
      arguments: [
        tx.pure.address(wallet),
        tx.pure.u64(score)
      ]
    });

    const result = await client.signAndExecuteTransaction({
      transaction: tx,
      signer: keypair,
      options: { showEffects: true }
    });

    console.log("✅ Trophy NFT Minted →", result.digest);
    return result;

  } catch (err) {
    console.error("❌ Trophy Mint Failed:", err);
    throw err;
  }
}
