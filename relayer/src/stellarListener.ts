export type StellarDepositEvent = {
  from: string;
  amount: bigint;
  ethRecipient: string; // 20-byte hex
  nonce: bigint;
  txHash: string;
};

/**
 * TODO: Poll the Stellar RPC (config.stellar.rpcUrl) for contract events
 * on config.stellar.bridgeContractId with topic "deposit".
 * Parse each event into StellarDepositEvent and call onDeposit.
 * Track the ledger cursor so you don't re-process events.
 */
export async function listenStellarDeposits(
  _onDeposit: (event: StellarDepositEvent) => Promise<void>,
  _fromLedger = 0
): Promise<void> {
  throw new Error("not implemented");
}
