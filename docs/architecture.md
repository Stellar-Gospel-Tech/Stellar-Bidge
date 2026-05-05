# Architecture

## Overview

A trust-minimized bridge enabling ERC-20 tokens to move onto Stellar as SEP-41 tokens, and back.

## Components

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER / DAPP                             │
└────────────────┬────────────────────────────┬───────────────────┘
                 │                            │
     ┌───────────▼──────────┐    ┌────────────▼──────────┐
     │  StellarBridge.sol   │    │  bridge (Soroban)     │
     │  (Ethereum)          │    │  (Stellar)            │
     │  - deposit()  lock   │    │  - deposit()  lock    │
     │  - release()  unlock │    │  - release()  unlock  │
     └───────────┬──────────┘    └────────────┬──────────┘
                 │                            │
                 └──────────┬─────────────────┘
                            │
                 ┌──────────▼──────────┐
                 │      RELAYER        │
                 │  - ethListener.ts   │
                 │  - stellarListener  │
                 │  - submitter.ts     │
                 └─────────────────────┘
```

## Token Flow

### ETH → Stellar
1. User calls `StellarBridge.deposit(token, amount, stellarRecipient, nonce)` on Ethereum
2. ERC-20 tokens are locked in the contract
3. Relayer observes `Deposit` event after N confirmations
4. Relayer calls `bridge.release(recipient, amount, ethTxHash)` on Stellar
5. SEP-41 tokens are transferred to the recipient on Stellar

### Stellar → ETH
1. User calls `bridge.deposit(from, amount, ethRecipient, nonce)` on Stellar
2. SEP-41 tokens are locked in the Soroban contract
3. Relayer observes the `deposit` event on Stellar
4. Relayer calls `StellarBridge.release(to, token, amount, stellarTxHash)` on Ethereum
5. ERC-20 tokens are released to the recipient on Ethereum

## Replay Protection

Both contracts track processed transaction hashes and reject duplicates.

## Trust Model (current)

Single relayer (admin key). Upgrade path: replace admin with an m-of-n multisig
(Gnosis Safe on Ethereum, Stellar multisig on Stellar side) — see open issues.
