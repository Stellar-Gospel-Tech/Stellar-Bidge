# Architecture

## Overview

A trust-minimized bridge enabling ERC-20 tokens to move onto Stellar as SEP-41 tokens, and back.

**Legend:** ✅ implemented · 🔨 open for contributors

---

## Components

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER / DAPP                             │
└────────────────┬────────────────────────────┬───────────────────┘
                 │                            │
     ┌───────────▼──────────┐    ┌────────────▼──────────┐
     │  StellarBridge.sol   │    │  bridge (Soroban)     │
     │  (Ethereum)       ✅ │    │  (Stellar)         ⚠️ │
     │  - deposit()  lock   │    │  - initialize()  ✅   │
     │  - release()  unlock │    │  - set_admin()   ✅   │
     │  - addToken()        │    │  - deposit()     🔨   │
     │  - removeToken()     │    │  - release()     🔨   │
     └───────────┬──────────┘    └────────────┬──────────┘
                 │                            │
                 └──────────┬─────────────────┘
                            │
                 ┌──────────▼──────────┐
                 │      RELAYER     🔨 │
                 │  - ethListener.ts   │
                 │  - stellarListener  │
                 │  - submitter.ts     │
                 └─────────────────────┘
```

---

## Token Flow

### ETH → Stellar
1. User calls `StellarBridge.deposit(token, amount, stellarRecipient, nonce)` on Ethereum
2. ERC-20 tokens are locked in the contract; `Deposit` event emitted
3. Relayer observes event after N confirmations (`ethListener.ts`)
4. Relayer calls `bridge.release(recipient, amount, ethTxHash)` on Stellar (`submitter.ts`)
5. SEP-41 tokens transferred to recipient on Stellar; `release` event emitted

### Stellar → ETH
1. User calls `bridge.deposit(from, amount, ethRecipient, nonce)` on Stellar
2. SEP-41 tokens locked in Soroban contract; deposit event emitted
3. Relayer observes event (`stellarListener.ts`)
4. Relayer calls `StellarBridge.release(to, token, amount, stellarTxHash)` on Ethereum
5. ERC-20 tokens released to recipient; `Release` event emitted

---

## Replay Protection

Both contracts track processed transaction hashes and reject duplicates:

- **Solidity:** `mapping(bytes32 => bool) public processed` — checked and set in `release()`
- **Soroban:** `DataKey::Processed(BytesN<32>)` in persistent storage — checked and set in `release()` (SB-003)

---

## Contract Interfaces

### StellarBridge.sol (Ethereum) ✅

```solidity
function deposit(address token, uint256 amount, bytes calldata stellarRecipient, uint64 nonce) external
function release(address to, address token, uint256 amount, bytes32 stellarTxHash) external onlyOwner
function addToken(address token) external onlyOwner
function removeToken(address token) external onlyOwner
```

### bridge (Soroban/Stellar) ⚠️

```rust
fn initialize(env, admin: Address, token: Address)   // ✅
fn set_admin(env, new_admin: Address)                 // ✅
fn deposit(env, from, amount, eth_recipient, nonce)   // 🔨 SB-002
fn release(env, to, amount, eth_tx_hash)              // 🔨 SB-003
fn admin(env) -> Address                              // ✅ view
fn token(env) -> Address                              // ✅ view
fn is_processed(env, eth_tx_hash) -> bool             // ✅ view
```

---

## Trust Model

**Current (v0):** Single relayer (admin key). The relayer is the only entity that can call `release()` on both contracts.

**Upgrade path (SB-020):** Replace the single admin key with an m-of-n multisig:
- Ethereum: Gnosis Safe
- Stellar: native Stellar multisig on the relayer account

---

## Decimal Normalisation (SB-017)

ERC-20 tokens use 18 decimals; SEP-41 tokens on Stellar use 7. The relayer must normalise amounts when crossing chains:

```
ETH → Stellar:  stellar_amount = eth_amount / 10^(18-7) = eth_amount / 10^11
Stellar → ETH:  eth_amount = stellar_amount * 10^11
```

This is not yet implemented — see issue SB-017.
