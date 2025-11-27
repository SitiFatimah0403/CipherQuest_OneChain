module trophy_addr::trophy {

    use 0x2::tx_context::TxContext;
    use 0x2::object::{Self, UID};
    use 0x2::transfer;
    use 0x2::event;

    use std::string;

    public struct TrophyNFT has key, store {
        id: UID,
        owner: address,
        score: u64,
        timestamp: u64,
        name: string::String,
        description: string::String,
        image_url: string::String,
    }

    public struct TrophyMintedEvent has copy, drop {
        owner: address,
        score: u64,
        timestamp: u64,
    }

    public entry fun mint_trophy(
        recipient: address,
        score: u64,
        ctx: &mut TxContext
    ) {
        let now = ctx.epoch_timestamp_ms();

        let nft = TrophyNFT {
            id: object::new(ctx),   // ✅ FIXED HERE
            owner: recipient,
            score,
            timestamp: now,
            name: string::utf8(b"CipherQuest Trophy"),
            description: string::utf8(b"Reward for completing CipherQuest level."),
            image_url: string::utf8(b"https://ipfs.io/ipfs/bafkreiflz2o5wliez6of4hicvet2smgp732xmwyhihbkaq27o2fxjrkhxe"),
        };

        event::emit(TrophyMintedEvent {
            owner: recipient,
            score,
            timestamp: now,
        });

        transfer::transfer(nft, recipient);
    }
}
