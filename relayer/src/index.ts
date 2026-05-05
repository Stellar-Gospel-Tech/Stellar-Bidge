import { listenEthDeposits } from "./ethListener";
import { listenStellarDeposits } from "./stellarListener";
import { releaseStellar, releaseEthereum } from "./submitter";

/**
 * TODO: Wire the two listeners to their respective submitters.
 *
 * ETH → Stellar:
 *   listenEthDeposits → releaseStellar
 *
 * Stellar → ETH:
 *   listenStellarDeposits → releaseEthereum
 *
 * You'll also need a token mapping (ERC-20 address ↔ Soroban contract ID)
 * so the relayer knows which token to release on the destination chain.
 */
async function main() {
  throw new Error("not implemented");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
