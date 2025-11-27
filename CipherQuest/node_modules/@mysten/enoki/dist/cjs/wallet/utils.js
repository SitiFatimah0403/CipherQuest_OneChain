"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var utils_exports = {};
__export(utils_exports, {
  getSession: () => getSession,
  getWalletMetadata: () => getWalletMetadata,
  isEnokiWallet: () => isEnokiWallet,
  isFacebookWallet: () => isFacebookWallet,
  isGoogleWallet: () => isGoogleWallet,
  isTwitchWallet: () => isTwitchWallet
});
module.exports = __toCommonJS(utils_exports);
var import_ui = require("@wallet-standard/ui");
var import_features = require("./features.js");
function isEnokiWallet(wallet) {
  if (isWalletHandle(wallet)) {
    return wallet.features.includes(import_features.EnokiGetMetadata);
  }
  return import_features.EnokiGetMetadata in wallet.features;
}
function getWalletMetadata(wallet) {
  if (isWalletHandle(wallet)) {
    try {
      const { getMetadata } = (0, import_ui.getWalletFeature)(
        wallet,
        import_features.EnokiGetMetadata
      );
      return getMetadata();
    } catch {
      return null;
    }
  } else if (import_features.EnokiGetMetadata in wallet.features) {
    const walletWithFeature = wallet;
    return walletWithFeature.features[import_features.EnokiGetMetadata].getMetadata();
  }
  return null;
}
async function getSession(wallet, input) {
  if (isWalletHandle(wallet)) {
    try {
      const { getSession: getSession2 } = (0, import_ui.getWalletFeature)(
        wallet,
        import_features.EnokiGetSession
      );
      return await getSession2(input);
    } catch {
      return null;
    }
  } else if (import_features.EnokiGetSession in wallet.features) {
    const walletWithFeature = wallet;
    return await walletWithFeature.features[import_features.EnokiGetSession].getSession(input);
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
//# sourceMappingURL=utils.js.map
