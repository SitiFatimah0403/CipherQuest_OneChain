import { registerEnokiWallets } from "./register.js";
function enokiWalletsInitializer(options) {
  return {
    id: "enoki-wallets-initializer",
    async initialize({
      networks,
      getClient
    }) {
      const { unregister } = registerEnokiWallets({
        ...options,
        getCurrentNetwork: () => getClient().network,
        clients: networks.map(getClient)
      });
      return { unregister };
    }
  };
}
export {
  enokiWalletsInitializer
};
//# sourceMappingURL=initializer.js.map
