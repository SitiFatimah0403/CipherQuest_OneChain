import type { ClientWithCoreApi, Experimental_SuiClientTypes } from '@mysten/sui/experimental';
import type { RegisterEnokiWalletsOptions } from './types.js';
export declare function enokiWalletsInitializer(options: Omit<RegisterEnokiWalletsOptions, 'clients' | 'getCurrentNetwork'>): {
    id: string;
    initialize({ networks, getClient, }: {
        networks: readonly Experimental_SuiClientTypes.Network[];
        getClient: (network?: Experimental_SuiClientTypes.Network) => ClientWithCoreApi;
    }): Promise<{
        unregister: () => void;
    }>;
};
