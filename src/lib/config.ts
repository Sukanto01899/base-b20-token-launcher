import type { Address } from "viem";

// Feature flags. Toggle these to show/hide in-progress or experimental features
// without removing the code. The project owner can flip these any time.
export const FEATURES = {
  // "Payment using B20" tab — send a B20 token to someone with an attached memo.
  paymentWithMemo: true,
};

// B20Deployer contract addresses per chain.
// Fill in after running: base-forge script script/DeployB20Deployer.s.sol --rpc-url <rpc> --broadcast
// Set to null to skip the fee gate and call the factory directly (useful during local dev).
export const B20_DEPLOYER_ADDRESSES: Partial<Record<number, Address>> = {
  84532: "0xcAe72EcA87A7E2539dce98F47027563e5091096e", // Base Sepolia — paste address after deploy
  8453: "0xe1585Cfc9b5b927feA2c3b0C72Ca35361243D535", // Base Mainnet — paste address after deploy
};

// Top announcement bar. Keep `enabled: false` until B20 mainnet activation is actually
// confirmed (check via the Activation Registry — see project notes) — showing this before
// that would tell users something false. Bump `id` if you change the message so it
// reappears for users who dismissed an earlier version.
export const ANNOUNCEMENT = {
  enabled: true,
  id: "b20-mainnet-live-2",
  message: "B20 is live on Base Mainnet — deploy now.",
};
