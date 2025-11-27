"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __typeError = (msg) => {
  throw TypeError(msg);
};
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
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
var state_exports = {};
__export(state_exports, {
  EnokiWalletState: () => EnokiWalletState
});
module.exports = __toCommonJS(state_exports);
var import_idb_keyval = require("idb-keyval");
var import_nanostores = require("nanostores");
var import_encryption = require("../encryption.js");
var _encryption, _encryptionKey, _stateStore, _sessionContextByNetwork, _zkLoginState, _EnokiWalletState_instances, createZkLoginState_fn;
const sessionKey = "zklogin-session";
const stateKey = "zklogin-state";
class EnokiWalletState {
  constructor(config) {
    __privateAdd(this, _EnokiWalletState_instances);
    __privateAdd(this, _encryption);
    __privateAdd(this, _encryptionKey);
    __privateAdd(this, _stateStore);
    __privateAdd(this, _sessionContextByNetwork);
    __privateAdd(this, _zkLoginState);
    __privateSet(this, _encryptionKey, config.apiKey);
    __privateSet(this, _encryption, (0, import_encryption.createDefaultEncryption)());
    __privateSet(this, _stateStore, (0, import_idb_keyval.createStore)(`${config.apiKey}_${config.clientId}`, "enoki"));
    __privateSet(this, _zkLoginState, __privateMethod(this, _EnokiWalletState_instances, createZkLoginState_fn).call(this));
    __privateSet(this, _sessionContextByNetwork, config.clients.reduce((accumulator, client) => {
      const network = client.network;
      const idbStore = (0, import_idb_keyval.createStore)(`${config.apiKey}_${network}_${config.clientId}`, "enoki");
      const sessionContext = {
        $zkLoginSession: (0, import_nanostores.atom)({ initialized: false, value: null }),
        client,
        idbStore
      };
      (0, import_nanostores.onMount)(sessionContext.$zkLoginSession, () => {
        this.getSession(sessionContext);
      });
      return accumulator.set(network, sessionContext);
    }, /* @__PURE__ */ new Map()));
  }
  get zkLoginState() {
    return __privateGet(this, _zkLoginState);
  }
  get sessionContextByNetwork() {
    return __privateGet(this, _sessionContextByNetwork);
  }
  getSessionContext(network) {
    const context = __privateGet(this, _sessionContextByNetwork).get(network);
    if (!context) {
      throw new Error(`The network ${network} isn't supported.`);
    }
    return context;
  }
  async logout() {
    __privateGet(this, _zkLoginState).set(null);
    await (0, import_idb_keyval.clear)(__privateGet(this, _stateStore));
    for (const context of __privateGet(this, _sessionContextByNetwork).values()) {
      await this.setSession(context, null);
      await (0, import_idb_keyval.clear)(context.idbStore);
    }
  }
  async setSession(context, newValue) {
    if (newValue) {
      const storedValue = await __privateGet(this, _encryption).encrypt(
        __privateGet(this, _encryptionKey),
        JSON.stringify(newValue)
      );
      await (0, import_idb_keyval.set)(sessionKey, storedValue, context.idbStore);
    } else {
      await (0, import_idb_keyval.del)(sessionKey, context.idbStore);
    }
    context.$zkLoginSession.set({ initialized: true, value: newValue });
  }
  async getSession({ $zkLoginSession, idbStore }) {
    if ($zkLoginSession.get().initialized) {
      return $zkLoginSession.get().value;
    }
    try {
      const storedValue = await (0, import_idb_keyval.get)(sessionKey, idbStore);
      if (!storedValue) return null;
      const state = JSON.parse(
        await __privateGet(this, _encryption).decrypt(__privateGet(this, _encryptionKey), storedValue)
      );
      if (state?.expiresAt && Date.now() > state.expiresAt) {
        await this.logout();
      } else {
        $zkLoginSession.set({ initialized: true, value: state });
      }
    } catch {
      $zkLoginSession.set({ initialized: true, value: null });
    }
    return $zkLoginSession.get().value;
  }
}
_encryption = new WeakMap();
_encryptionKey = new WeakMap();
_stateStore = new WeakMap();
_sessionContextByNetwork = new WeakMap();
_zkLoginState = new WeakMap();
_EnokiWalletState_instances = new WeakSet();
createZkLoginState_fn = function() {
  const $zkLoginState = (0, import_nanostores.atom)(null);
  (0, import_nanostores.onMount)($zkLoginState, () => {
    (0, import_nanostores.task)(async () => {
      try {
        const rawStoredValue = await (0, import_idb_keyval.get)(stateKey, __privateGet(this, _stateStore));
        if (rawStoredValue) {
          $zkLoginState.set(JSON.parse(rawStoredValue));
        }
      } catch {
      }
    });
  });
  (0, import_nanostores.onSet)($zkLoginState, ({ newValue }) => {
    (0, import_idb_keyval.set)(stateKey, JSON.stringify(newValue), __privateGet(this, _stateStore));
  });
  return $zkLoginState;
};
//# sourceMappingURL=state.js.map
