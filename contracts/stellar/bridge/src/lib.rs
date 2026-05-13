#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, token, Address, Bytes, BytesN, Env};

#[contracttype]
pub enum DataKey {
    Admin,
    TokenAddress,
    Processed(BytesN<32>),
}

#[contract]
pub struct BridgeContract;

#[contractimpl]
impl BridgeContract {
    /// Initialize the bridge with an admin and the SEP-41 token it manages.
    /// Panics if called more than once.
    pub fn initialize(env: Env, admin: Address, token: Address) {
        assert!(
            !env.storage().instance().has(&DataKey::Admin),
            "already initialized"
        );
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TokenAddress, &token);
    }

    /// Transfer the admin role to a new address.
    pub fn set_admin(env: Env, new_admin: Address) {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("not initialized");
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &new_admin);
    }

    /// Lock SEP-41 tokens in this contract so the relayer can mint ERC-20
    /// equivalents on Ethereum.
    pub fn deposit(env: Env, from: Address, amount: i128, eth_recipient: Bytes, nonce: u64) {
        from.require_auth();

        assert!(amount > 0, "amount must be positive");

        let token_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::TokenAddress)
            .expect("not initialized");

        // Transfer tokens from `from` into this contract
        token::Client::new(&env, &token_addr).transfer(
            &from,
            &env.current_contract_address(),
            &amount,
        );

        // Emit event so the relayer can observe and act
        env.events().publish(
            (symbol_short!("deposit"), from),
            (amount, eth_recipient, nonce),
        );
    }

    /// Release locked tokens to `to` after the relayer confirms an ETH deposit.
    ///
    /// # TODO (SB-003)
    /// 1. Load admin, call `admin.require_auth()`
    /// 2. Check `DataKey::Processed(eth_tx_hash)` — panic with `"already processed"` if set
    /// 3. Mark hash as processed: `env.storage().persistent().set(&DataKey::Processed(eth_tx_hash), &true)`
    /// 4. Transfer `amount` tokens from this contract to `to`
    /// 5. Emit a release event
    ///
    /// See issue SB-003 for full acceptance criteria and test cases.
    pub fn release(_env: Env, _to: Address, _amount: i128, _eth_tx_hash: BytesN<32>) {
        todo!("SB-003: admin auth → replay check → mark processed → transfer tokens → emit event")
    }

    // ── View functions (already implemented) ─────────────────────────────────

    pub fn admin(env: Env) -> Address {
        env.storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("not initialized")
    }

    pub fn token(env: Env) -> Address {
        env.storage()
            .instance()
            .get(&DataKey::TokenAddress)
            .expect("not initialized")
    }

    pub fn is_processed(env: Env, eth_tx_hash: BytesN<32>) -> bool {
        env.storage()
            .persistent()
            .has(&DataKey::Processed(eth_tx_hash))
    }
}

#[cfg(test)]
mod test;
