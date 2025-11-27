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
var register_exports = {};
__export(register_exports, {
  registerEnokiWallets: () => registerEnokiWallets
});
module.exports = __toCommonJS(register_exports);
var import_wallet = require("./wallet.js");
var import_wallet_standard = require("@mysten/wallet-standard");
var import_utils = require("../utils.js");
var import_providers = require("./providers.js");
function registerEnokiWallets({
  providers,
  windowFeatures = defaultWindowFeatures,
  ...config
}) {
  const clients = "clients" in config ? config.clients : [Object.assign(config.client, { network: config.network ?? "mainnet" })];
  const enokiCompatibleClients = clients.filter(({ network }) => (0, import_utils.isEnokiNetwork)(network));
  if (enokiCompatibleClients.length === 0) {
    throw new Error("None of the specified clients are compatible with Enoki.");
  }
  const getCurrentNetwork = "clients" in config ? config.getCurrentNetwork : () => clients[0].network;
  const walletsApi = (0, import_wallet_standard.getWallets)();
  const wallets = {};
  for (const { name, icon, provider } of import_providers.ENOKI_PROVIDER_WALLETS_INFO) {
    const providerOptions = providers[provider];
    if (providerOptions) {
      wallets[provider] = new import_wallet.EnokiWallet({
        ...providerOptions,
        name,
        icon,
        provider,
        windowFeatures,
        getCurrentNetwork,
        apiKey: config.apiKey,
        apiUrl: config.apiUrl,
        clients: enokiCompatibleClients
      });
    }
  }
  const unregister = walletsApi.register(...Object.values(wallets));
  return { wallets, unregister };
}
function defaultWindowFeatures() {
  const width = 500;
  const height = 800;
  const left = (screen.width - width) / 2;
  const top = (screen.height - height) / 4;
  return `popup=1;toolbar=0;status=0;resizable=1,width=${width},height=${height},top=${top},left=${left}`;
}
//# sourceMappingURL=register.js.map
