export interface DeployedToken {
  address: string;
  name: string;
  symbol: string;
  deployer: string;
  chainId: number;
  deployedAt: number;
}

const STORAGE_KEY = "b20-deployed-tokens";

// Pass chainId to only return tokens deployed on that network — a token saved while on
// Sepolia doesn't exist on Mainnet (and vice versa), so mixing them in a picker is wrong.
export function getDeployedTokens(chainId?: number): DeployedToken[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const tokens = raw ? (JSON.parse(raw) as DeployedToken[]) : [];
    return chainId === undefined ? tokens : tokens.filter((t) => t.chainId === chainId);
  } catch {
    return [];
  }
}

export function saveDeployedToken(token: DeployedToken) {
  if (typeof window === "undefined") return;
  const existing = getDeployedTokens().filter((t) => t.address.toLowerCase() !== token.address.toLowerCase());
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([token, ...existing]));
}
