# Build Plan — Stellar Bridge

## Priority order

The project is built in dependency order. Each layer must be stable before the next starts.

```
Layer 1 → Layer 2 → Layer 3 → Layer 4 → Layer 5
Soroban    Solidity   Relayer   Hardening  SDK
```

---

## Layer 1 — Soroban bridge contract (highest priority)
**`contracts/stellar/bridge/`**

Everything else depends on this. The Soroban contract is the most novel piece — there are no open-source references for a Soroban-native bridge, so it needs the most care.

| Issue | Task | Complexity |
|-------|------|------------|
| SB-001 | Implement `initialize` — store admin + token, guard against re-init | Trivial |
| SB-002 | Implement `deposit` — auth, lock SEP-41 tokens, emit event | Medium |
| SB-003 | Implement `release` — admin auth, transfer tokens to recipient | Medium |
| SB-004 | Replay protection on `release` — reject duplicate `eth_tx_hash` | Trivial |
| SB-005 | Emit structured contract events on deposit and release | Trivial |
| SB-006 | Full test suite — all tests currently `#[should_panic]`, make them pass | Medium |

**Done when:** `cargo test` passes with no `#[should_panic]` markers and the contract builds to WASM.

---

## Layer 2 — Ethereum Solidity contract
**`contracts/ethereum/`**

Can be worked in parallel with Layer 1 by a different contributor.

| Issue | Task | Complexity |
|-------|------|------------|
| SB-007 | Implement `deposit` — validate, lock ERC-20, emit event | Medium |
| SB-008 | Implement `release` — owner-only, replay protection, transfer out | Medium |
| SB-009 | Token whitelist — `addToken` / `removeToken` admin controls | Trivial |
| SB-010 | Hardhat test suite — deposit, release, replay protection, access control | Medium |

**Done when:** `npm test` passes in `contracts/ethereum/`.

---

## Layer 3 — Relayer service
**`relayer/`**

Depends on Layer 1 + 2 being stable (needs their event signatures and function ABIs).

| Issue | Task | Complexity |
|-------|------|------------|
| SB-011 | `ethListener.ts` — watch Ethereum `Deposit` events, wait for confirmations | Medium |
| SB-012 | `stellarListener.ts` — poll Stellar RPC for bridge contract `deposit` events | Medium |
| SB-013 | `submitter.ts` — `releaseStellar()` build + sign + submit Soroban tx | High |
| SB-014 | `submitter.ts` — `releaseEthereum()` call Solidity `release()` | Medium |
| SB-015 | `index.ts` — wire listeners to submitters, token address mapping | Medium |
| SB-016 | Retry + error handling — failed submissions must retry with backoff | Medium |

**Done when:** Relayer starts, listens on both chains, and successfully relays a transfer on testnet.

---

## Layer 4 — Hardening
**Both contracts + relayer**

Depends on Layer 3 being functional end-to-end.

| Issue | Task | Complexity |
|-------|------|------------|
| SB-017 | Decimal normalisation — ERC-20 (18 decimals) ↔ SEP-41 (7 decimals) | Medium |
| SB-018 | Pause / unpause on both contracts (emergency stop) | Medium |
| SB-019 | Testnet deploy scripts — Sepolia (Ethereum) + Testnet (Stellar) | Medium |
| SB-020 | Multisig upgrade path — replace single relayer key with m-of-n | High |

**Done when:** Both contracts deployed on testnet, a full round-trip transfer works, and the relayer key is a multisig.

---

## Layer 5 — SDK
**`sdk/`** *(not scaffolded yet — created when Layer 3 is stable)*

A thin TypeScript wrapper so dApps can integrate without touching contracts directly.

| Issue | Task | Complexity |
|-------|------|------------|
| SB-021 | `bridge(ethToken, amount, stellarRecipient)` — ETH → Stellar helper | Medium |
| SB-022 | `bridge(stellarToken, amount, ethRecipient)` — Stellar → ETH helper | Medium |
| SB-023 | `getTransferStatus(txHash)` — poll both chains for transfer state | Medium |

**Done when:** SDK published to npm, README has a working code example.

---

## What is NOT in scope (for now)

- Frontend / UI
- Support for more than one token pair at launch
- Mainnet deployment
- Decentralised validator set (multisig is the stepping stone)

---

## Repo checklist before applying to Drips Wave

- [ ] Push repo to GitHub (public)
- [ ] Set `REPO` in `scripts/create-issues.sh`
- [ ] Write issue body files (`scripts/issues/issue-01.md` … `issue-20.md`)
- [ ] Run `./scripts/create-issues.sh all` to create all issues
- [ ] Apply repo to Stellar Wave Program at drips.network/wave
- [ ] Wait for SDF approval
