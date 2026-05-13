# Build Plan — Stellar Bridge

## Priority order

```
Layer 1 → Layer 2 → Layer 3 → Layer 4 → Layer 5
Soroban    Solidity   Relayer   Hardening  SDK
```

**Legend:** ✅ done · ⚠️ partial · 🔨 open

---

## Layer 1 — Soroban bridge contract ⚠️
**`contracts/stellar/bridge/`**

| Issue | Task | Status | Notes |
|---|---|---|---|
| SB-001 | `initialize` — store admin + token, guard re-init | ✅ | 2 passing tests |
| — | `set_admin` — transfer admin role | ✅ | 1 passing test |
| SB-002 | `deposit` — auth, lock SEP-41 tokens, emit event | 🔨 | todo! stub with acceptance criteria |
| SB-003 | `release` — admin auth, replay protection, transfer out | 🔨 | todo! stub with acceptance criteria |
| SB-004 | Replay protection on `release` | 🔨 | Part of SB-003 |
| SB-005 | Structured contract events on deposit and release | 🔨 | Part of SB-002/003 |
| SB-006 | Full test suite — remove all `#[should_panic]` | 🔨 | Blocked on SB-002/003 |

**Done when:** `cargo test` passes with no `#[should_panic]` markers and contract builds to WASM.

---

## Layer 2 — Ethereum Solidity contract ✅
**`contracts/ethereum/`**

| Issue | Task | Status | Notes |
|---|---|---|---|
| SB-007 | `deposit` — validate, lock ERC-20, emit event | ✅ | 4 tests |
| SB-008 | `release` — owner-only, replay protection, transfer out | ✅ | 4 tests |
| SB-009 | Token whitelist — `addToken` / `removeToken` | ✅ | 3 tests |
| — | Full Hardhat test suite | ✅ | 12/12 passing |

---

## Layer 3 — Relayer service 🔨
**`relayer/`**

Depends on Layer 1 + 2 being stable.

| Issue | Task | Complexity |
|---|---|---|
| SB-011 | `ethListener.ts` — watch Ethereum `Deposit` events, wait for confirmations | Medium |
| SB-012 | `stellarListener.ts` — poll Stellar RPC for bridge contract `deposit` events | Medium |
| SB-013 | `submitter.ts` — `releaseStellar()` build + sign + submit Soroban tx | High |
| SB-014 | `submitter.ts` — `releaseEthereum()` call Solidity `release()` | Medium |
| SB-015 | `index.ts` — wire listeners to submitters, token address mapping | Medium |
| SB-016 | Retry + error handling — failed submissions retry with backoff | Medium |

**Done when:** Relayer starts, listens on both chains, and successfully relays a transfer on testnet.

---

## Layer 4 — Hardening 🔨

| Issue | Task | Complexity |
|---|---|---|
| SB-017 | Decimal normalisation — ERC-20 (18 dec) ↔ SEP-41 (7 dec) | Medium |
| SB-018 | Pause / unpause on both contracts (emergency stop) | Medium |
| SB-019 | Testnet deploy scripts — Sepolia + Stellar Testnet | Medium |
| SB-020 | Multisig upgrade — replace single relayer key with m-of-n | High |

---

## Layer 5 — SDK 🔨
**`sdk/`** *(not scaffolded yet)*

| Issue | Task | Complexity |
|---|---|---|
| SB-021 | `bridge(ethToken, amount, stellarRecipient)` — ETH → Stellar | Medium |
| SB-022 | `bridge(stellarToken, amount, ethRecipient)` — Stellar → ETH | Medium |
| SB-023 | `getTransferStatus(txHash)` — poll both chains | Medium |

---

## Open Contributor Issues

| Issue | Scope | Complexity | Blocked by |
|---|---|---|---|
| **SB-002** | Soroban `deposit` — auth + token lock + event | Medium | — |
| **SB-003** | Soroban `release` — admin auth + replay protection + transfer | Medium | SB-002 |
| **SB-006** | Full Soroban test suite (remove `#[should_panic]`) | Medium | SB-002, SB-003 |
| **SB-011** | `ethListener.ts` | Medium | Layer 1 deployed |
| **SB-012** | `stellarListener.ts` | Medium | Layer 1 deployed |
| **SB-013** | `releaseStellar()` in submitter | High | SB-011, SB-012 |

---

## Milestones

| Milestone | Requires | Status |
|---|---|---|
| **M0 — Apply to Drips Wave** | Layer 1 partial + Layer 2 done | ✅ Ready |
| **M1 — Soroban contract complete** | SB-002, SB-003, SB-006 | 🔨 |
| **M2 — Relayer running on testnet** | Layer 3 | 🔨 |
| **M3 — Full round-trip on testnet** | Layer 4 | 🔨 |
| **M4 — SDK published** | Layer 5 | 🔨 |
