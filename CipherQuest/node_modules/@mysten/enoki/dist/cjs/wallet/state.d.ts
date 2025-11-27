import type { WritableAtom } from 'nanostores';
import type { EnokiClientConfig } from '../EnokiClient/index.js';
import type { ClientWithCoreApi, Experimental_SuiClientTypes } from '@mysten/sui/experimental';
import type { EnokiSessionContext, ZkLoginSession, ZkLoginState } from './types.js';
export type EnokiWalletStateConfig = EnokiClientConfig & {
    clients: ClientWithCoreApi[];
    clientId: string;
};
export declare class EnokiWalletState {
    #private;
    constructor(config: EnokiWalletStateConfig);
    get zkLoginState(): WritableAtom<ZkLoginState | null>;
    get sessionContextByNetwork(): Map<Experimental_SuiClientTypes.Network, EnokiSessionContext>;
    getSessionContext(network: Experimental_SuiClientTypes.Network): EnokiSessionContext;
    logout(): Promise<void>;
    setSession(context: EnokiSessionContext, newValue: ZkLoginSession | null): Promise<void>;
    getSession({ $zkLoginSession, idbStore }: EnokiSessionContext): Promise<ZkLoginSession | null>;
}
