var __typeError = (msg) => {
  throw TypeError(msg);
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
var _encryption, _encryptionKey, _stateStore, _sessionContextByNetwork, _zkLoginState, _EnokiWalletState_instances, createZkLoginState_fn;
import { clear, createStore, del, get, set } from "idb-keyval";
import { atom, onMount, onSet, task } from "nanostores";
import { createDefaultEncryption } from "../encryption.js";
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
    __privateSet(this, _encryption, createDefaultEncryption());
    __privateSet(this, _stateStore, createStore(`${config.apiKey}_${config.clientId}`, "enoki"));
    __privateSet(this, _zkLoginState, __privateMethod(this, _EnokiWalletState_instances, createZkLoginState_fn).call(this));
    __privateSet(this, _sessionContextByNetwork, config.clients.reduce((accumulator, client) => {
      const network = client.network;
      const idbStore = createStore(`${config.apiKey}_${network}_${config.clientId}`, "enoki");
      const sessionContext = {
        $zkLoginSession: atom({ initialized: false, value: null }),
        client,
        idbStore
      };
      onMount(sessionContext.$zkLoginSession, () => {
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
    await clear(__privateGet(this, _stateStore));
    for (const context of __privateGet(this, _sessionContextByNetwork).values()) {
      await this.setSession(context, null);
      await clear(context.idbStore);
    }
  }
  async setSession(context, newValue) {
    if (newValue) {
      const storedValue = await __privateGet(this, _encryption).encrypt(
        __privateGet(this, _encryptionKey),
        JSON.stringify(newValue)
      );
      await set(sessionKey, storedValue, context.idbStore);
    } else {
      await del(sessionKey, context.idbStore);
    }
    context.$zkLoginSession.set({ initialized: true, value: newValue });
  }
  async getSession({ $zkLoginSession, idbStore }) {
    if ($zkLoginSession.get().initialized) {
      return $zkLoginSession.get().value;
    }
    try {
      const storedValue = await get(sessionKey, idbStore);
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
  const $zkLoginState = atom(null);
  onMount($zkLoginState, () => {
    task(async () => {
      try {
        const rawStoredValue = await get(stateKey, __privateGet(this, _stateStore));
        if (rawStoredValue) {
          $zkLoginState.set(JSON.parse(rawStoredValue));
        }
      } catch {
      }
    });
  });
  onSet($zkLoginState, ({ newValue }) => {
    set(stateKey, JSON.stringify(newValue), __privateGet(this, _stateStore));
  });
  return $zkLoginState;
};
export {
  EnokiWalletState
};
//# sourceMappingURL=state.js.map
