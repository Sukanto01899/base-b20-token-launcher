import {
  BaseError,
  ContractFunctionRevertedError,
  type Address,
  type Hex,
  encodeAbiParameters,
  encodeFunctionData,
  keccak256,
  parseAbiParameters,
  toBytes,
  zeroHash,
} from "viem";

export const B20_FACTORY_ADDRESS: Address = "0xB20f000000000000000000000000000000000000";

export const B20Variant = { ASSET: 0, STABLECOIN: 1 } as const;
export type B20VariantName = keyof typeof B20Variant;

export const MINT_ROLE = keccak256(toBytes("MINT_ROLE"));
export const DEFAULT_ADMIN_ROLE: Hex = zeroHash;

// uint128.max — the factory's "no cap" sentinel.
export const NO_SUPPLY_CAP = 2n ** 128n - 1n;

export const b20FactoryAbi = [
  {
    type: "function",
    name: "createB20",
    stateMutability: "payable",
    inputs: [
      { name: "variant", type: "uint8" },
      { name: "salt", type: "bytes32" },
      { name: "params", type: "bytes" },
      { name: "initCalls", type: "bytes[]" },
    ],
    outputs: [{ name: "token", type: "address" }],
  },
] as const;

export const b20TokenAbi = [
  {
    type: "function",
    name: "name",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    type: "function",
    name: "symbol",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
  {
    type: "function",
    name: "totalSupply",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "supplyCap",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "hasRole",
    stateMutability: "view",
    inputs: [
      { name: "role", type: "bytes32" },
      { name: "account", type: "address" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "grantRole",
    stateMutability: "nonpayable",
    inputs: [
      { name: "role", type: "bytes32" },
      { name: "account", type: "address" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "updateSupplyCap",
    stateMutability: "nonpayable",
    inputs: [{ name: "newSupplyCap", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "mint",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  // Errors below let viem decode revert reasons into readable names/args instead of raw selectors.
  { type: "error", name: "AccessControlUnauthorizedAccount", inputs: [{ name: "account", type: "address" }, { name: "neededRole", type: "bytes32" }] },
  { type: "error", name: "SupplyCapExceeded", inputs: [{ name: "cap", type: "uint256" }, { name: "attempted", type: "uint256" }] },
  { type: "error", name: "InvalidAmount", inputs: [] },
  { type: "error", name: "InvalidReceiver", inputs: [{ name: "receiver", type: "address" }] },
  { type: "error", name: "ContractPaused", inputs: [{ name: "feature", type: "uint8" }] },
  { type: "error", name: "PolicyForbids", inputs: [{ name: "policyScope", type: "bytes32" }, { name: "policyId", type: "uint64" }] },
] as const;

// abi.encode(struct) in Solidity wraps the struct as a single dynamic tuple argument — an
// outer offset slot followed by the tuple's own head/tail encoding — not a flat field list.
// These mirror B20FactoryLib's encoders by encoding a single tuple-typed parameter.
export function encodeAssetCreateParams(name: string, symbol: string, initialAdmin: Address, decimals: number): Hex {
  return encodeAbiParameters(
    parseAbiParameters("(uint8 version, string name, string symbol, address initialAdmin, uint8 decimals)"),
    [{ version: 1, name, symbol, initialAdmin, decimals }],
  );
}

export function encodeStablecoinCreateParams(
  name: string,
  symbol: string,
  initialAdmin: Address,
  currency: string,
): Hex {
  return encodeAbiParameters(
    parseAbiParameters("(uint8 version, string name, string symbol, address initialAdmin, string currency)"),
    [{ version: 1, name, symbol, initialAdmin, currency }],
  );
}

export function encodeGrantRole(role: Hex, account: Address): Hex {
  return encodeFunctionData({ abi: b20TokenAbi, functionName: "grantRole", args: [role, account] });
}

export function encodeUpdateSupplyCap(newSupplyCap: bigint): Hex {
  return encodeFunctionData({ abi: b20TokenAbi, functionName: "updateSupplyCap", args: [newSupplyCap] });
}

// Pulls the new token address out of the B20Created event (token is topics[1], left-padded to 32 bytes).
export function extractTokenAddress(logs: readonly { address: Address; topics: readonly Hex[] }[]): Address | null {
  const log = logs.find((l) => l.address.toLowerCase() === B20_FACTORY_ADDRESS.toLowerCase());
  if (!log || !log.topics[1]) return null;
  return `0x${log.topics[1].slice(-40)}` as Address;
}

const CONTRACT_ERROR_MESSAGES: Record<string, string> = {
  AccessControlUnauthorizedAccount: "This address does not have MINT_ROLE — it cannot mint this token.",
  SupplyCapExceeded: "That amount would exceed this token's supply cap.",
  InvalidAmount: "Enter a valid, non-zero amount.",
  InvalidReceiver: "Invalid recipient address.",
  ContractPaused: "Minting is currently paused for this token.",
  PolicyForbids: "A policy rule on this token is blocking the mint.",
};

// Decodes a viem/wagmi contract error into a short, human-readable message.
export function formatContractError(error: unknown): string {
  if (error instanceof BaseError) {
    const revertError = error.walk((e) => e instanceof ContractFunctionRevertedError);
    if (revertError instanceof ContractFunctionRevertedError) {
      const errorName = revertError.data?.errorName;
      if (errorName && CONTRACT_ERROR_MESSAGES[errorName]) return CONTRACT_ERROR_MESSAGES[errorName];
    }
    return error.shortMessage;
  }
  return error instanceof Error ? error.message : "Something went wrong.";
}
