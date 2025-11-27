module 0x0::cipherquest {

    use one::tx_context::TxContext;
    use one::object;
    use one::object::UID;
    use one::transfer;
    use one::event;
    use one::coin::{Coin, split, value};
    use one::oct::OCT;       // ✅ THIS IS THE CORRECT TOKEN MODULE

    use std::string;

    /// ADMIN WALLET
    const ADMIN: address = @cipher_addr;

    /// ===============================
    /// Trophy NFT
    /// ===============================

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
            id: object::new(ctx),
            owner: recipient,
            score,
            timestamp: now,
            name: string::utf8(b"CipherQuest Trophy"),
            description: string::utf8(b"Reward for completing CipherQuest level."),
            image_url: string::utf8(b"https://ipfs.io/ipfs/bafkreiflz2o5wliez6of4hicvet2smgp732xmwyhihbkaq27o2fxjrkhxe"),
        };

        event::emit(TrophyMintedEvent { owner: recipient, score, timestamp: now });

        transfer::public_transfer(nft, recipient);
    }

    /// ===============================
    /// Rank Badge NFT
    /// ===============================

    public struct RankBadge has key, store {
        id: UID,
        owner: address,
        rank: u64,
        uri: string::String,
    }

    /// Mint Rank Badge + OCT Reward
    public entry fun mint_rank(
        recipient: address,
        rank: u64,
        admin_funds: &mut Coin<OCT>,
        ctx: &mut TxContext
    ) {
        assert!(ctx.sender() == ADMIN, 1);

        let uri = if (rank == 1) {
            string::utf8(b"ipfs://placeholder.rank1.json")
        } else {
            string::utf8(b"ipfs://placeholder.rank2.json")
        };

        let badge = RankBadge {
            id: object::new(ctx),
            owner: recipient,
            rank,
            uri,
        };

        transfer::public_transfer(badge, recipient);

        // 0.003 or 0.005 OCT
        let reward = if (rank == 1) { 3_000_000 } else { 5_000_000 };
        let balance = value(admin_funds);

        if (balance > 0) {
            let amount = if (balance >= reward) { reward } else { balance };
            let payout = split(admin_funds, amount, ctx);
            transfer::public_transfer(payout, recipient);
        }
    }

    /// ===============================
    /// Skin Purchase
    /// ===============================

    public entry fun purchase_skin(
        payment: Coin<OCT>,
        ctx: &mut TxContext
    ) {
        transfer::public_transfer(payment, ADMIN);
    }
}
