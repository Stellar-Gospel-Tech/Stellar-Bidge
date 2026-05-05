#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Bytes, BytesN, Env};

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
    /// TODO: Store admin and token address. Panic if already initialized.
    pub fn initialize(_env: Env, _admin: Address, _token: Address) {
        unimplemented!()
    }

    /// TODO: Require auth from `from`, transfer `amount` of SEP-41 tokens into
    /// this contract, then emit a deposit event so the relayer can act.
    pub fn deposit(_env: Env, _from: Address, _amount: i128, _eth_recipient: Bytes, _nonce: u64) {
        unimplemented!()
    }

    /// TODO: Require admin auth. Check `eth_tx_hash` hasn't been processed (replay
    /// protection). Transfer `amount` tokens to `to` and mark the hash as processed.
    pub fn release(_env: Env, _to: Address, _amount: i128, _eth_tx_hash: BytesN<32>) {
        unimplemented!()
    }

    /// TODO: Require admin auth. Update the stored admin address.
    pub fn set_admin(_env: Env, _new_admin: Address) {
        unimplemented!()
    }

    pub fn admin(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Admin).unwrap()
    }

    pub fn token(env: Env) -> Address {
        env.storage().instance().get(&DataKey::TokenAddress).unwrap()
    }

    pub fn is_processed(env: Env, eth_tx_hash: BytesN<32>) -> bool {
        env.storage().persistent().has(&DataKey::Processed(eth_tx_hash))
    }
}

#[cfg(test)]
mod test;
