import { EnokiWallet } from "./wallet.js";
import { getWallets } from "@mysten/wallet-standard";
import { isEnokiNetwork } from "../utils.js";
import { ENOKI_PROVIDER_WALLETS_INFO } from "./providers.js";
function registerEnokiWallets({
  providers,
  windowFeatures = defaultWindowFeatures,
  ...config
}) {
  const clients = "clients" in config ? config.clients : [Object.assign(config.client, { network: config.network ?? "mainnet" })];
  const enokiCompatibleClients = clients.filter(({ network }) => isEnokiNetwork(network));
  if (enokiCompatibleClients.length === 0) {
    throw new Error("None of the specified clients are compatible with Enoki.");
  }
  const getCurrentNetwork = "clients" in config ? config.getCurrentNetwork : () => clients[0].network;
  const walletsApi = getWallets();
  const wallets = {};
  for (const { name, icon, provider } of ENOKI_PROVIDER_WALLETS_INFO) {
    const providerOptions = providers[provider];
    if (providerOptions) {
      wallets[provider] = new EnokiWallet({
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
export {
  registerEnokiWallets
};
//# sourceMappingURL=register.js.map
