import { EnokiWallet } from './wallet.js';
import type { RegisterEnokiWalletsOptions } from './types.js';
import type { AuthProvider } from '../EnokiClient/type.js';
export declare function registerEnokiWallets({ providers, windowFeatures, ...config }: RegisterEnokiWalletsOptions): {
    wallets: Partial<Record<AuthProvider, EnokiWallet>>;
    unregister: () => void;
};
