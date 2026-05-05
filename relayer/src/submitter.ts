/**
 * TODO: Build and submit a `release` transaction on the Stellar bridge contract.
 * Use config.stellar.relayerSecretKey to sign.
 * Return the Stellar transaction hash.
 */
export async function releaseStellar(
  _recipient: string,
  _amount: bigint,
  _ethTxHash: string
): Promise<string> {
  throw new Error("not implemented");
}

/**
 * TODO: Call `release(to, token, amount, stellarTxHash)` on StellarBridge.sol.
 * Use config.ethereum.relayerPrivateKey to sign.
 * Return the Ethereum transaction hash.
 */
export async function releaseEthereum(
  _to: string,
  _token: string,
  _amount: bigint,
  _stellarTxHash: string
): Promise<string> {
  throw new Error("not implemented");
}
