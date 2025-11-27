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
var index_exports = {};
__export(index_exports, {
  EnokiClient: () => import_EnokiClient.EnokiClient,
  EnokiClientError: () => import_EnokiClient.EnokiClientError,
  EnokiFlow: () => import_EnokiFlow.EnokiFlow,
  EnokiKeypair: () => import_EnokiKeypair.EnokiKeypair,
  EnokiPublicKey: () => import_EnokiKeypair.EnokiPublicKey,
  createDefaultEncryption: () => import_encryption.createDefaultEncryption,
  createInMemoryStorage: () => import_stores.createInMemoryStorage,
  createLocalStorage: () => import_stores.createLocalStorage,
  createSessionStorage: () => import_stores.createSessionStorage,
  enokiWalletsInitializer: () => import_initializer.enokiWalletsInitializer,
  getSession: () => import_utils.getSession,
  getWalletMetadata: () => import_utils.getWalletMetadata,
  isEnokiNetwork: () => import_utils2.isEnokiNetwork,
  isEnokiWallet: () => import_utils.isEnokiWallet,
  isFacebookWallet: () => import_utils.isFacebookWallet,
  isGoogleWallet: () => import_utils.isGoogleWallet,
  isTwitchWallet: () => import_utils.isTwitchWallet,
  registerEnokiWallets: () => import_register.registerEnokiWallets
});
module.exports = __toCommonJS(index_exports);
var import_EnokiClient = require("./EnokiClient/index.js");
var import_EnokiFlow = require("./EnokiFlow.js");
var import_stores = require("./stores.js");
var import_encryption = require("./encryption.js");
var import_EnokiKeypair = require("./EnokiKeypair.js");
var import_register = require("./wallet/register.js");
var import_initializer = require("./wallet/initializer.js");
var import_utils = require("./wallet/utils.js");
var import_utils2 = require("./utils.js");
//# sourceMappingURL=index.js.map
