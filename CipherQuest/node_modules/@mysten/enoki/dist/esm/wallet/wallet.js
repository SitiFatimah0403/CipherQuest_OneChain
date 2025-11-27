var __typeError = (msg) => {
  throw TypeError(msg);
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
var _events, _accounts, _name, _icon, _enokiClient, _state, _provider, _clientId, _redirectUrl, _extraParams, _getCurrentNetwork, _windowFeatures, _signTransaction, _signAndExecuteTransaction, _signPersonalMessage, _getMetadata, _getSession, _on, _connect, _disconnect, _EnokiWallet_instances, getAuthorizedAccounts_fn, getKeypair_fn, getSignerContext_fn, createSession_fn, getPKCEFlowContext_fn, createAuthorizationURL_fn, handleAuthCallback_fn, pkceTokenExchange_fn;
import { Transaction } from "@mysten/sui/transactions";
import { fromBase64, toBase64 } from "@mysten/sui/utils";
import {
  ReadonlyWalletAccount,
  StandardConnect,
  StandardDisconnect,
  StandardEvents,
  SuiSignAndExecuteTransaction,
  SuiSignPersonalMessage,
  SuiSignTransaction
} from "@mysten/wallet-standard";
import mitt from "mitt";
import { EnokiGetMetadata, EnokiGetSession } from "./features.js";
import { decodeJwt } from "@mysten/sui/zklogin";
import { WebCryptoSigner } from "@mysten/signers/webcrypto";
import { get, set } from "idb-keyval";
import { EnokiClient } from "../EnokiClient/index.js";
import { EnokiKeypair } from "../EnokiKeypair.js";
import { EnokiWalletState } from "./state.js";
import { allTasks } from "nanostores";
const pkceFlowProviders = {
  playtron: {
    tokenEndpoint: "https://oauth2.playtron.one/oauth2/token"
  }
};
class EnokiWallet {
  constructor({
    name,
    icon,
    provider,
    clientId,
    redirectUrl,
    extraParams,
    windowFeatures,
    getCurrentNetwork,
    apiKey,
    apiUrl,
    clients
  }) {
    __privateAdd(this, _EnokiWallet_instances);
    __privateAdd(this, _events);
    __privateAdd(this, _accounts);
    __privateAdd(this, _name);
    __privateAdd(this, _icon);
    __privateAdd(this, _enokiClient);
    __privateAdd(this, _state);
    __privateAdd(this, _provider);
    __privateAdd(this, _clientId);
    __privateAdd(this, _redirectUrl);
    __privateAdd(this, _extraParams);
    __privateAdd(this, _getCurrentNetwork);
    __privateAdd(this, _windowFeatures);
    __privateAdd(this, _signTransaction, async ({ transaction, chain, account, signal }) => {
      signal?.throwIfAborted();
      const { client, keypair } = await __privateMethod(this, _EnokiWallet_instances, getSignerContext_fn).call(this, chain);
      const parsedTransaction = Transaction.from(await transaction.toJSON());
      const suiAddress = keypair.toSuiAddress();
      if (suiAddress !== account.address) {
        throw new Error(
          `The specified account ${account.address} does not match the currently connected Enoki address ${suiAddress}.`
        );
      }
      parsedTransaction.setSenderIfNotSet(suiAddress);
      return keypair.signTransaction(await parsedTransaction.build({ client }));
    });
    __privateAdd(this, _signAndExecuteTransaction, async ({
      transaction,
      chain,
      account,
      signal
    }) => {
      signal?.throwIfAborted();
      const { client, keypair } = await __privateMethod(this, _EnokiWallet_instances, getSignerContext_fn).call(this, chain);
      const parsedTransaction = Transaction.from(await transaction.toJSON());
      const bytes = await parsedTransaction.build({ client });
      const suiAddress = keypair.toSuiAddress();
      if (suiAddress !== account.address) {
        throw new Error(
          `The specified account ${account.address} does not match the currently connected Enoki address ${suiAddress}.`
        );
      }
      parsedTransaction.setSenderIfNotSet(suiAddress);
      const result = await keypair.signAndExecuteTransaction({
        transaction: parsedTransaction,
        client
      });
      return {
        bytes: toBase64(bytes),
        signature: result.signatures[0],
        digest: result.digest,
        effects: toBase64(result.effects.bcs)
      };
    });
    __privateAdd(this, _signPersonalMessage, async ({ message, account, chain }) => {
      const { keypair } = await __privateMethod(this, _EnokiWallet_instances, getSignerContext_fn).call(this, chain);
      const suiAddress = keypair.toSuiAddress();
      if (suiAddress !== account.address) {
        throw new Error(
          `The specified account ${account.address} does not match the currently connected Enoki address ${suiAddress}.`
        );
      }
      return keypair.signPersonalMessage(message);
    });
    __privateAdd(this, _getMetadata, () => {
      return {
        provider: __privateGet(this, _provider)
      };
    });
    __privateAdd(this, _getSession, async (input) => {
      const sessionContext = __privateGet(this, _state).getSessionContext(
        input?.network ?? __privateGet(this, _getCurrentNetwork).call(this)
      );
      return await __privateGet(this, _state).getSession(sessionContext);
    });
    __privateAdd(this, _on, (event, listener) => {
      __privateGet(this, _events).on(event, listener);
      return () => __privateGet(this, _events).off(event, listener);
    });
    __privateAdd(this, _connect, async (input) => {
      await allTasks();
      if (input?.silent || __privateGet(this, _accounts).length > 0) {
        return { accounts: __privateGet(this, _accounts) };
      }
      const currentNetwork = __privateGet(this, _getCurrentNetwork).call(this);
      await __privateMethod(this, _EnokiWallet_instances, createSession_fn).call(this, { network: currentNetwork });
      return { accounts: __privateGet(this, _accounts) };
    });
    __privateAdd(this, _disconnect, async () => {
      await __privateGet(this, _state).logout();
      __privateSet(this, _accounts, []);
      __privateGet(this, _events).emit("change", { accounts: __privateGet(this, _accounts) });
    });
    __privateSet(this, _events, mitt());
    __privateSet(this, _name, name);
    __privateSet(this, _icon, icon);
    __privateSet(this, _enokiClient, new EnokiClient({ apiKey, apiUrl }));
    __privateSet(this, _state, new EnokiWalletState({ apiKey, clientId, clients }));
    __privateSet(this, _provider, provider);
    __privateSet(this, _clientId, clientId);
    __privateSet(this, _redirectUrl, redirectUrl || window.location.href.split("#")[0]);
    __privateSet(this, _extraParams, extraParams);
    __privateSet(this, _windowFeatures, windowFeatures);
    __privateSet(this, _getCurrentNetwork, getCurrentNetwork);
    __privateSet(this, _accounts, []);
    __privateGet(this, _state).zkLoginState.subscribe(() => {
      __privateSet(this, _accounts, __privateMethod(this, _EnokiWallet_instances, getAuthorizedAccounts_fn).call(this));
      __privateGet(this, _events).emit("change", { accounts: __privateGet(this, _accounts) });
    });
  }
  get name() {
    return __privateGet(this, _name);
  }
  get provider() {
    return __privateGet(this, _provider);
  }
  get icon() {
    return __privateGet(this, _icon);
  }
  get version() {
    return "1.0.0";
  }
  get chains() {
    return [...__privateGet(this, _state).sessionContextByNetwork.keys()].map(
      (network) => `sui:${network}`
    );
  }
  get accounts() {
    return __privateGet(this, _accounts);
  }
  get features() {
    return {
      [StandardConnect]: {
        version: "1.0.0",
        connect: __privateGet(this, _connect)
      },
      [StandardDisconnect]: {
        version: "1.0.0",
        disconnect: __privateGet(this, _disconnect)
      },
      [StandardEvents]: {
        version: "1.0.0",
        on: __privateGet(this, _on)
      },
      [SuiSignTransaction]: {
        version: "2.0.0",
        signTransaction: __privateGet(this, _signTransaction)
      },
      [SuiSignAndExecuteTransaction]: {
        version: "2.0.0",
        signAndExecuteTransaction: __privateGet(this, _signAndExecuteTransaction)
      },
      [SuiSignPersonalMessage]: {
        version: "1.1.0",
        signPersonalMessage: __privateGet(this, _signPersonalMessage)
      },
      [EnokiGetMetadata]: {
        version: "1.0.0",
        getMetadata: __privateGet(this, _getMetadata)
      },
      [EnokiGetSession]: {
        version: "1.0.0",
        getSession: __privateGet(this, _getSession)
      }
    };
  }
}
_events = new WeakMap();
_accounts = new WeakMap();
_name = new WeakMap();
_icon = new WeakMap();
_enokiClient = new WeakMap();
_state = new WeakMap();
_provider = new WeakMap();
_clientId = new WeakMap();
_redirectUrl = new WeakMap();
_extraParams = new WeakMap();
_getCurrentNetwork = new WeakMap();
_windowFeatures = new WeakMap();
_signTransaction = new WeakMap();
_signAndExecuteTransaction = new WeakMap();
_signPersonalMessage = new WeakMap();
_getMetadata = new WeakMap();
_getSession = new WeakMap();
_on = new WeakMap();
_connect = new WeakMap();
_disconnect = new WeakMap();
_EnokiWallet_instances = new WeakSet();
getAuthorizedAccounts_fn = function() {
  const zkLoginState = __privateGet(this, _state).zkLoginState.get();
  if (zkLoginState) {
    return [
      new ReadonlyWalletAccount({
        address: zkLoginState.address,
        chains: this.chains,
        icon: this.icon,
        features: [SuiSignPersonalMessage, SuiSignTransaction, SuiSignAndExecuteTransaction],
        publicKey: fromBase64(zkLoginState.publicKey)
      })
    ];
  }
  return [];
};
getKeypair_fn = async function(sessionContext) {
  const session = await __privateGet(this, _state).getSession(sessionContext);
  if (!session?.jwt || Date.now() > session.expiresAt) {
    await __privateMethod(this, _EnokiWallet_instances, createSession_fn).call(this, { network: sessionContext.client.network });
  }
  const storedNativeSigner = await get(
    "ephemeralKeyPair",
    sessionContext.idbStore
  );
  if (!storedNativeSigner) {
    throw new Error("Native signer not found in store.");
  }
  const updatedSession = await __privateGet(this, _state).getSession(sessionContext);
  if (!updatedSession?.jwt) {
    throw new Error("Failed to retrieve an active session.");
  }
  const ephemeralKeypair = WebCryptoSigner.import(storedNativeSigner);
  const proof = updatedSession.proof ?? await __privateGet(this, _enokiClient).createZkLoginZkp({
    network: sessionContext.client.network,
    jwt: updatedSession.jwt,
    maxEpoch: updatedSession.maxEpoch,
    randomness: updatedSession.randomness,
    ephemeralPublicKey: ephemeralKeypair.getPublicKey()
  });
  await __privateGet(this, _state).setSession(sessionContext, { ...updatedSession, proof });
  return new EnokiKeypair({
    address: this.accounts[0].address,
    maxEpoch: updatedSession.maxEpoch,
    ephemeralKeypair,
    proof
  });
};
getSignerContext_fn = async function(chain) {
  const sessionContext = chain ? __privateGet(this, _state).getSessionContext(chain.split(":")[1]) : null;
  if (!sessionContext) {
    throw new Error(
      `A valid Sui chain identifier was not provided in the request. Please report this issue to the dApp developer. Examples of valid Sui chain identifiers are 'sui:testnet' and 'sui:mainnet'. Consider using the '@mysten/dapp-kit' package, which provides this value automatically.`
    );
  }
  const keypair = await __privateMethod(this, _EnokiWallet_instances, getKeypair_fn).call(this, sessionContext);
  return { client: sessionContext.client, keypair };
};
createSession_fn = async function({ network }) {
  const popup = window.open(
    void 0,
    "_blank",
    typeof __privateGet(this, _windowFeatures) === "function" ? __privateGet(this, _windowFeatures).call(this) : __privateGet(this, _windowFeatures)
  );
  if (!popup) {
    throw new Error("Failed to open popup");
  }
  const sessionContext = __privateGet(this, _state).getSessionContext(network);
  const pkceContext = await __privateMethod(this, _EnokiWallet_instances, getPKCEFlowContext_fn).call(this);
  popup.location = await __privateMethod(this, _EnokiWallet_instances, createAuthorizationURL_fn).call(this, sessionContext, pkceContext);
  return await new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(interval);
          reject(new Error("Popup closed"));
        }
        if (!pkceContext && !popup.location.hash || pkceContext && !popup.location.search) {
          return;
        }
      } catch {
        return;
      }
      clearInterval(interval);
      __privateMethod(this, _EnokiWallet_instances, handleAuthCallback_fn).call(this, {
        hash: popup.location.hash,
        sessionContext,
        search: popup.location.search,
        pkceContext
      }).then(() => resolve(), reject);
      try {
        popup.close();
      } catch (e) {
        console.error(e);
      }
    }, 16);
  });
};
getPKCEFlowContext_fn = async function() {
  if (!pkceFlowProviders[__privateGet(this, _provider)]) {
    return;
  }
  const array = new Uint8Array(64);
  crypto.getRandomValues(array);
  const codeVerifier = toBase64(array).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const codeChallenge = toBase64(
    new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(codeVerifier)))
  ).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  return { codeVerifier, codeChallenge };
};
createAuthorizationURL_fn = async function(sessionContext, pkceContext) {
  const ephemeralKeyPair = await WebCryptoSigner.generate();
  const { nonce, randomness, maxEpoch, estimatedExpiration } = await __privateGet(this, _enokiClient).createZkLoginNonce({
    network: sessionContext.client.network,
    ephemeralPublicKey: ephemeralKeyPair.getPublicKey()
  });
  const extraParams = typeof __privateGet(this, _extraParams) === "function" ? __privateGet(this, _extraParams).call(this) : __privateGet(this, _extraParams);
  const params = new URLSearchParams({
    ...extraParams,
    nonce,
    client_id: __privateGet(this, _clientId),
    redirect_uri: __privateGet(this, _redirectUrl),
    response_type: "id_token",
    scope: ["openid", ...extraParams?.scope ? extraParams.scope.split(" ") : []].filter(Boolean).join(" "),
    ...pkceContext ? {
      response_type: "code",
      code_challenge_method: "S256",
      code_challenge: pkceContext.codeChallenge
    } : void 0
  });
  let oauthUrl;
  switch (__privateGet(this, _provider)) {
    case "google":
      oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
      break;
    case "facebook":
      oauthUrl = `https://www.facebook.com/v17.0/dialog/oauth?${params}`;
      break;
    case "twitch":
      params.set("force_verify", "true");
      oauthUrl = `https://id.twitch.tv/oauth2/authorize?${params}`;
      break;
    case "onefc":
      oauthUrl = `https://login.onepassport.onefc.com/de3ee5c1-5644-4113-922d-e8336569a462/b2c_1a_prod_signupsignin_onesuizklogin/oauth2/v2.0/authorize?${params}`;
      break;
    case "playtron":
      oauthUrl = `https://oauth2.playtron.one/oauth2/auth?${params}`;
      break;
    default:
      throw new Error(`Invalid provider: ${__privateGet(this, _provider)}`);
  }
  await set("ephemeralKeyPair", ephemeralKeyPair.export(), sessionContext.idbStore);
  await __privateGet(this, _state).setSession(sessionContext, {
    expiresAt: estimatedExpiration,
    maxEpoch,
    randomness
  });
  return oauthUrl;
};
handleAuthCallback_fn = async function({
  hash,
  sessionContext,
  pkceContext,
  search
}) {
  const params = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  const zkp = await __privateGet(this, _state).getSession(sessionContext);
  if (!zkp?.maxEpoch || !zkp.randomness) {
    throw new Error(
      "Start of sign-in flow could not be found. Ensure you have started the sign-in flow before calling this."
    );
  }
  const jwt = pkceContext ? await __privateMethod(this, _EnokiWallet_instances, pkceTokenExchange_fn).call(this, search, pkceContext) : params.get("id_token");
  if (!jwt) {
    throw new Error("Missing ID Token");
  }
  decodeJwt(jwt);
  const { address, publicKey } = await __privateGet(this, _enokiClient).getZkLogin({ jwt });
  __privateGet(this, _state).zkLoginState.set({ address, publicKey });
  await __privateGet(this, _state).setSession(sessionContext, { ...zkp, jwt });
  return params.get("state");
};
pkceTokenExchange_fn = async function(search, pkceContext) {
  const params = new URLSearchParams(search);
  const code = params.get("code");
  if (!code) {
    throw new Error("Missing code");
  }
  const tokenEndpoint = pkceFlowProviders[__privateGet(this, _provider)]?.tokenEndpoint;
  if (!tokenEndpoint) {
    throw new Error(`PKCE flow not supported for provider: ${__privateGet(this, _provider)}`);
  }
  const response = await fetch(tokenEndpoint, {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: __privateGet(this, _clientId),
      redirect_uri: __privateGet(this, _redirectUrl),
      code,
      code_verifier: pkceContext.codeVerifier
    })
  });
  return (await response.json()).id_token;
};
export {
  EnokiWallet
};
//# sourceMappingURL=wallet.js.map
