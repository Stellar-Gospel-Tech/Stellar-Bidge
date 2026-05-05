import * as dotenv from "dotenv";
dotenv.config();

export const config = {
  ethereum: {
    rpcUrl: process.env.ETH_RPC_URL!,
    bridgeAddress: process.env.ETH_BRIDGE_ADDRESS!,
    relayerPrivateKey: process.env.ETH_RELAYER_PRIVATE_KEY!,
    confirmations: Number(process.env.ETH_CONFIRMATIONS ?? "12"),
  },
  stellar: {
    rpcUrl: process.env.STELLAR_RPC_URL ?? "https://soroban-testnet.stellar.org",
    networkPassphrase:
      process.env.STELLAR_NETWORK_PASSPHRASE ??
      "Test SDF Network ; September 2015",
    bridgeContractId: process.env.STELLAR_BRIDGE_CONTRACT_ID!,
    relayerSecretKey: process.env.STELLAR_RELAYER_SECRET_KEY!,
  },
};
