import { ethers } from "ethers";
import { config } from "./config";

const BRIDGE_ABI = [
  "event Deposit(address indexed from, address indexed token, uint256 amount, bytes stellarRecipient, uint64 nonce)",
];

export type DepositEvent = {
  from: string;
  token: string;
  amount: bigint;
  stellarRecipient: string;
  nonce: bigint;
  txHash: string;
};

/**
 * TODO: Connect to Ethereum via config.ethereum.rpcUrl.
 * Listen for Deposit events on the bridge contract.
 * Wait for config.ethereum.confirmations before calling onDeposit.
 */
export async function listenEthDeposits(
  _onDeposit: (event: DepositEvent) => Promise<void>
): Promise<void> {
  throw new Error("not implemented");
}
