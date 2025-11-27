import { getWalletFeature } from "@wallet-standard/ui";
import { EnokiGetMetadata, EnokiGetSession } from "./features.js";
function isEnokiWallet(wallet) {
  if (isWalletHandle(wallet)) {
    return wallet.features.includes(EnokiGetMetadata);
  }
  return EnokiGetMetadata in wallet.features;
}
function getWalletMetadata(wallet) {
  if (isWalletHandle(wallet)) {
    try {
      const { getMetadata } = getWalletFeature(
        wallet,
        EnokiGetMetadata
      );
      return getMetadata();
    } catch {
      return null;
    }
  } else if (EnokiGetMetadata in wallet.features) {
    const walletWithFeature = wallet;
    return walletWithFeature.features[EnokiGetMetadata].getMetadata();
  }
  return null;
}
async function getSession(wallet, input) {
  if (isWalletHandle(wallet)) {
    try {
      const { getSession: getSession2 } = getWalletFeature(
        wallet,
        EnokiGetSession
      );
      return await getSession2(input);
    } catch {
      return null;
    }
  } else if (EnokiGetSession in wallet.features) {
    const walletWithFeature = wallet;
    return await walletWithFeature.features[EnokiGetSession].getSession(input);
  }
  return null;
}
function isGoogleWallet(wallet) {
  return getWalletMetadata(wallet)?.provider === "google";
}
function isTwitchWallet(wallet) {
  return getWalletMetadata(wallet)?.provider === "twitch";
}
function isFacebookWallet(wallet) {
  return getWalletMetadata(wallet)?.provider === "facebook";
}
function isWalletHandle(wallet) {
  return Array.isArray(wallet.features);
}
export {
  getSession,
  getWalletMetadata,
  isEnokiWallet,
  isFacebookWallet,
  isGoogleWallet,
  isTwitchWallet
};
//# sourceMappingURL=utils.js.map
