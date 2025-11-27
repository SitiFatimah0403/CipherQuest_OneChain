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
var initializer_exports = {};
__export(initializer_exports, {
  enokiWalletsInitializer: () => enokiWalletsInitializer
});
module.exports = __toCommonJS(initializer_exports);
var import_register = require("./register.js");
function enokiWalletsInitializer(options) {
  return {
    id: "enoki-wallets-initializer",
    async initialize({
      networks,
      getClient
    }) {
      const { unregister } = (0, import_register.registerEnokiWallets)({
        ...options,
        getCurrentNetwork: () => getClient().network,
        clients: networks.map(getClient)
      });
      return { unregister };
    }
  };
}
//# sourceMappingURL=initializer.js.map
