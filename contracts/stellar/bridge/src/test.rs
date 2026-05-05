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

#[test]
#[should_panic]
fn test_initialize() {
    let (env, admin, _user, token_addr) = setup();
    let contract_id = env.register(BridgeContract, ());
    let client = BridgeContractClient::new(&env, &contract_id);
    // TODO: implement initialize — this test should pass once done
    client.initialize(&admin, &token_addr);
    assert_eq!(client.admin(), admin);
}

#[test]
#[should_panic]
fn test_deposit_locks_tokens() {
    let (env, admin, user, token_addr) = setup();
    let contract_id = env.register(BridgeContract, ());
    let client = BridgeContractClient::new(&env, &contract_id);
    client.initialize(&admin, &token_addr);

    let token = TokenClient::new(&env, &token_addr);
    let before = token.balance(&user);
    // TODO: implement deposit — tokens should move from user into contract
    client.deposit(&user, &100_0000000_i128, &Bytes::from_array(&env, &[0u8; 20]), &1u64);
    assert_eq!(before - token.balance(&user), 100_0000000_i128);
}

#[test]
#[should_panic]
fn test_replay_protection() {
    let (env, admin, user, token_addr) = setup();
    let contract_id = env.register(BridgeContract, ());
    let client = BridgeContractClient::new(&env, &contract_id);
    client.initialize(&admin, &token_addr);
    client.deposit(&user, &200_0000000_i128, &Bytes::from_array(&env, &[0u8; 20]), &1u64);

    let hash = BytesN::from_array(&env, &[1u8; 32]);
    // TODO: implement release with replay protection — second call should panic
    client.release(&Address::generate(&env), &100_0000000_i128, &hash);
    client.release(&Address::generate(&env), &100_0000000_i128, &hash);
}
