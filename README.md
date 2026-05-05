# Stellar Bridge — Stellar ↔ Ethereum

A trust-minimized bridge that lets ERC-20 tokens move onto Stellar as SEP-41 tokens, and back.

> **Status:** Early development — contributions welcome.

## Problem

Stellar's ecosystem is isolated from the broader DeFi world. There is no open-source, composable, Soroban-native bridge that the community can audit, fork, and extend.

This project fills that gap: a fully open bridge anyone can run, inspect, and build on.

## Architecture

See [docs/architecture.md](docs/architecture.md) for the full design.

```
StellarBridge.sol (Ethereum)  ←→  Relayer (TypeScript)  ←→  bridge contract (Soroban/Stellar)
```

**ETH → Stellar:** Lock ERC-20 → relayer observes → mint SEP-41  
**Stellar → ETH:** Lock SEP-41 → relayer observes → release ERC-20

## Repo Structure

```
contracts/
  stellar/bridge/   # Soroban smart contract (Rust)
  ethereum/         # Solidity contract + Hardhat
relayer/            # Off-chain relayer service (TypeScript)
docs/               # Architecture and build plan
integration-tests/  # End-to-end tests (coming soon)
```

## Getting Started

### Prerequisites

- Rust + `cargo` with `wasm32-unknown-unknown` target
- Node.js ≥ 20
- [Stellar CLI](https://developers.stellar.org/docs/tools/cli/install-cli)

### Stellar contract

```bash
cd contracts/stellar/bridge
cargo test
cargo build --target wasm32-unknown-unknown --release
```

### Ethereum contract

```bash
cd contracts/ethereum
npm install
npm run compile
npm test
```

### Relayer

```bash
cd relayer
npm install
cp ../.env.example ../.env   # fill in your keys
npm start
```

## Contributing

Browse the open issues — each one has a complexity label and clear acceptance criteria.  
See [docs/plan.md](docs/plan.md) for the full build plan and layer breakdown.

## License

MIT
