import type { StandardConnectFeature, StandardDisconnectFeature, StandardEventsFeature, SuiSignAndExecuteTransactionFeature, SuiSignPersonalMessageFeature, SuiSignTransactionFeature, Wallet } from '@mysten/wallet-standard';
import { ReadonlyWalletAccount } from '@mysten/wallet-standard';
import type { AuthProvider } from '../EnokiClient/type.js';
import type { EnokiWalletOptions } from './types.js';
import type { EnokiGetMetadataFeature, EnokiGetSessionFeature } from './features.js';
export declare class EnokiWallet implements Wallet {
    #private;
    get name(): string;
    get provider(): AuthProvider;
    get icon(): `data:image/svg+xml;base64,${string}` | `data:image/webp;base64,${string}` | `data:image/png;base64,${string}` | `data:image/gif;base64,${string}`;
    get version(): "1.0.0";
    get chains(): `sui:${string & {}}`[];
    get accounts(): ReadonlyWalletAccount[];
    get features(): StandardConnectFeature & StandardDisconnectFeature & StandardEventsFeature & SuiSignTransactionFeature & SuiSignAndExecuteTransactionFeature & SuiSignPersonalMessageFeature & EnokiGetMetadataFeature & EnokiGetSessionFeature;
    constructor({ name, icon, provider, clientId, redirectUrl, extraParams, windowFeatures, getCurrentNetwork, apiKey, apiUrl, clients, }: EnokiWalletOptions);
}
