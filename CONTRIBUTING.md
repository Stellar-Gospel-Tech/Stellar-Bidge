# Contributing to Stellar Bridge

Thanks for your interest! This project runs on the **Stellar Wave** program via [Drips](https://drips.network/wave) — contributors earn on-chain rewards for merged PRs.

## Quick Start

```bash
# Soroban contract
cd contracts/stellar/bridge
cargo test

# Ethereum contract
cd contracts/ethereum
npm install && npm test

# Relayer
cd relayer
npm install
```

## How to Contribute

1. Browse open issues — each has a complexity label and clear acceptance criteria.
2. Apply to an issue via the [Drips Wave app](https://drips.network/wave) or leave a comment on GitHub.
3. Wait to be assigned before opening a PR (one contributor per issue per Wave).
4. Open a PR against `main`, referencing the issue (`Closes #N`).
5. Address review feedback; maintainer merges and marks the issue resolved.
6. Drips automatically calculates your share of the reward pool.

## Code Standards

**Soroban (Rust):**
- `cargo fmt` before committing
- `cargo clippy -- -D warnings` must pass
- Every new function needs at least one unit test

**Solidity:**
- `npm run compile` must pass with no warnings
- Every function needs Hardhat test coverage

**Relayer (TypeScript):**
- `npm run build` must pass
- No `any` types without justification

## Commit Style

```
<type>(<scope>): <short description>

Types: feat, fix, docs, test, refactor, chore
Scope: stellar, ethereum, relayer, ci
```

## Questions?

Open a GitHub Discussion or ping us in the issue thread.
