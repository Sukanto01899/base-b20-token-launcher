export interface DeployedToken {
  address: string;
  name: string;
  symbol: string;
  deployer: string;
  chainId: number;
  deployedAt: number;
}

const STORAGE_KEY = "b20-deployed-tokens";

export function getDeployedTokens(): DeployedToken[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DeployedToken[]) : [];
  } catch {
    return [];
  }
}

export function saveDeployedToken(token: DeployedToken) {
  if (typeof window === "undefined") return;
  const existing = getDeployedTokens().filter((t) => t.address.toLowerCase() !== token.address.toLowerCase());
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([token, ...existing]));
}
