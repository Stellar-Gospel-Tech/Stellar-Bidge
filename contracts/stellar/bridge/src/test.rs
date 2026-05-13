#![cfg(test)]
use super::*;
use soroban_sdk::{
    testutils::Address as _,
    token::{Client as TokenClient, StellarAssetClient},
    Address, Bytes, BytesN, Env,
};

fn setup() -> (Env, Address, Address, Address) {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let user = Address::generate(&env);

    let token_id = env.register_stellar_asset_contract_v2(admin.clone());
    let token_addr = token_id.address();
    StellarAssetClient::new(&env, &token_addr).mint(&user, &1_000_0000000_i128);

    (env, admin, user, token_addr)
}

// ── initialize ────────────────────────────────────────────────────────────────

#[test]
fn test_initialize() {
    let (env, admin, _user, token_addr) = setup();
    let contract_id = env.register(BridgeContract, ());
    let client = BridgeContractClient::new(&env, &contract_id);
    client.initialize(&admin, &token_addr);
    assert_eq!(client.admin(), admin);
    assert_eq!(client.token(), token_addr);
}

#[test]
#[should_panic(expected = "already initialized")]
fn test_double_initialize_panics() {
    let (env, admin, _user, token_addr) = setup();
    let contract_id = env.register(BridgeContract, ());
    let client = BridgeContractClient::new(&env, &contract_id);
    client.initialize(&admin, &token_addr);
    client.initialize(&admin, &token_addr);
}

// ── set_admin ─────────────────────────────────────────────────────────────────

#[test]
fn test_set_admin() {
    let (env, admin, _user, token_addr) = setup();
    let contract_id = env.register(BridgeContract, ());
    let client = BridgeContractClient::new(&env, &contract_id);
    client.initialize(&admin, &token_addr);

    let new_admin = Address::generate(&env);
    client.set_admin(&new_admin);
    assert_eq!(client.admin(), new_admin);
}

// ── deposit (SB-002) ──────────────────────────────────────────────────────────

#[test]
fn test_deposit_locks_tokens() {
    let (env, admin, user, token_addr) = setup();
    let contract_id = env.register(BridgeContract, ());
    let client = BridgeContractClient::new(&env, &contract_id);
    client.initialize(&admin, &token_addr);

    let token = TokenClient::new(&env, &token_addr);
    let before = token.balance(&user);
    client.deposit(&user, &100_0000000_i128, &Bytes::from_array(&env, &[0u8; 20]), &1u64);

    // Tokens moved from user into the contract
    assert_eq!(before - token.balance(&user), 100_0000000_i128);
    assert_eq!(token.balance(&contract_id), 100_0000000_i128);
}

// ── release + replay protection (SB-003) ─────────────────────────────────────
// Remove #[should_panic] once release is implemented.

#[test]
#[should_panic]
fn test_replay_protection() {
    let (env, admin, user, token_addr) = setup();
    let contract_id = env.register(BridgeContract, ());
    let client = BridgeContractClient::new(&env, &contract_id);
    client.initialize(&admin, &token_addr);
    client.deposit(&user, &200_0000000_i128, &Bytes::from_array(&env, &[0u8; 20]), &1u64);

    let hash = BytesN::from_array(&env, &[1u8; 32]);
    // SB-003: first release should succeed, second should panic
    client.release(&Address::generate(&env), &100_0000000_i128, &hash);
    client.release(&Address::generate(&env), &100_0000000_i128, &hash);
}
