import { NextRequest, NextResponse } from "next/server";
import {
  createPublicClient,
  encodeFunctionData,
  formatUnits,
  http,
  isAddress,
  keccak256,
  parseUnits,
  stringToHex,
  toBytes,
  type Address,
} from "viem";
import { base, baseSepolia } from "viem/chains";
import {
  B20_FACTORY_ADDRESS,
  B20Variant,
  MINT_ROLE,
  NO_SUPPLY_CAP,
  b20DeployerAbi,
  b20FactoryAbi,
  b20TokenAbi,
  encodeAssetCreateParams,
  encodeGrantRole,
  encodeStablecoinCreateParams,
  encodeUpdateSupplyCap,
} from "@/lib/b20";
import { B20_DEPLOYER_ADDRESSES } from "@/lib/config";

// ─────────────────────────────────────────────
//  Tool definitions
// ─────────────────────────────────────────────

const TOOLS = [
  {
    name: "b20_encode_deploy",
    description:
      "Encode a B20 token deployment. Returns {to, data, value} ready for Base MCP send_calls. " +
      "Routes through the platform deployer contract (fee collected) when available for the chain, " +
      "otherwise calls the factory directly. Token is fully owned by initialAdmin after deploy.",
    inputSchema: {
      type: "object",
      required: ["name", "symbol", "variant", "initialAdmin"],
      properties: {
        name: { type: "string", description: "Token name (e.g. My Token)" },
        symbol: { type: "string", description: "Token symbol (e.g. MYT)" },
        variant: {
          type: "string",
          enum: ["ASSET", "STABLECOIN"],
          description: "ASSET: configurable decimals 6-18. STABLECOIN: fixed 6 decimals + currency code.",
        },
        initialAdmin: { type: "string", description: "Wallet address that will own the token" },
        chainId: { type: "number", description: "8453 = Base Mainnet, 84532 = Base Sepolia (default: 8453)" },
        decimals: { type: "number", description: "Decimals 6-18 (ASSET only, default 18)" },
        currency: { type: "string", description: "3-letter currency code e.g. USD (STABLECOIN only)" },
        grantMintRole: {
          type: "boolean",
          description: "Grant MINT_ROLE to initialAdmin so they can mint immediately (default true)",
        },
        supplyCap: {
          type: "string",
          description: "Max total supply in whole tokens. Omit for no cap.",
        },
      },
    },
  },
  {
    name: "b20_encode_mint",
    description:
      "Encode a mint call for a B20 token. Checks B20 activation on the chain first — " +
      "returns a clear error if not yet activated. Caller must hold MINT_ROLE. " +
      "Returns {to, data, value} for Base MCP send_calls.",
    inputSchema: {
      type: "object",
      required: ["tokenAddress", "to", "amount", "decimals"],
      properties: {
        tokenAddress: { type: "string", description: "B20 token contract address" },
        to: { type: "string", description: "Recipient address" },
        amount: { type: "string", description: "Amount in whole tokens (e.g. '1000')" },
        decimals: { type: "number", description: "Token decimals" },
        chainId: { type: "number", description: "8453 = Base Mainnet, 84532 = Base Sepolia (default: 8453)" },
      },
    },
  },
  {
    name: "b20_encode_payment",
    description:
      "Encode a transferWithMemo call — sends B20 tokens with an onchain memo attached. " +
      "Returns {to, data, value} for Base MCP send_calls.",
    inputSchema: {
      type: "object",
      required: ["tokenAddress", "to", "amount", "decimals"],
      properties: {
        tokenAddress: { type: "string", description: "B20 token contract address" },
        to: { type: "string", description: "Recipient address" },
        amount: { type: "string", description: "Amount in whole tokens" },
        decimals: { type: "number", description: "Token decimals" },
        memo: { type: "string", description: "Onchain memo max 32 bytes (e.g. order ID)" },
      },
    },
  },
  {
    name: "b20_encode_grant_mint_role",
    description:
      "Encode a grantRole(MINT_ROLE) call. Caller must be DEFAULT_ADMIN_ROLE holder. " +
      "Returns {to, data, value} for Base MCP send_calls.",
    inputSchema: {
      type: "object",
      required: ["tokenAddress", "account"],
      properties: {
        tokenAddress: { type: "string", description: "B20 token contract address" },
        account: { type: "string", description: "Address to grant MINT_ROLE to" },
      },
    },
  },
  {
    name: "b20_read_token",
    description: "Read B20 token info (name, symbol, supply, cap) from the blockchain. No signing needed.",
    inputSchema: {
      type: "object",
      required: ["tokenAddress"],
      properties: {
        tokenAddress: { type: "string", description: "B20 token contract address" },
        chainId: {
          type: "number",
          description: "8453 = Base Mainnet, 84532 = Base Sepolia (default: 8453)",
        },
        checkMintRole: {
          type: "string",
          description: "Optional wallet address — check if it holds MINT_ROLE",
        },
      },
    },
  },
  {
    name: "b20_check_activation",
    description: "Check if B20 ASSET and STABLECOIN are activated on Base mainnet or Sepolia.",
    inputSchema: {
      type: "object",
      properties: {
        chainId: {
          type: "number",
          description: "8453 = Base Mainnet, 84532 = Base Sepolia (default: 8453)",
        },
      },
    },
  },
];

// ─────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────

function getClient(chainId = 8453) {
  const chain = chainId === 8453 ? base : baseSepolia;
  const rpc = chainId === 8453 ? "https://mainnet.base.org" : "https://sepolia.base.org";
  return createPublicClient({ chain, transport: http(rpc) });
}

function ok(id: unknown, text: string) {
  return { jsonrpc: "2.0", id, result: { content: [{ type: "text", text }] } };
}

function fail(id: unknown, text: string) {
  return { jsonrpc: "2.0", id, result: { content: [{ type: "text", text }], isError: true } };
}

// Returns an "ask user" response if any required fields are missing, otherwise null.
function askMissing(id: unknown, fields: { label: string; value: unknown }[]) {
  const missing = fields.filter((f) => f.value === undefined || f.value === null || f.value === "");
  if (missing.length === 0) return null;
  return ok(id, `Please provide the following before I continue:\n${missing.map((f) => `• ${f.label}`).join("\n")}`);
}

const ACTIVATION_REGISTRY = "0x8453000000000000000000000000000000000001" as Address;
const activationAbi = [{
  type: "function", name: "isActivated", stateMutability: "view",
  inputs: [{ name: "id", type: "bytes32" }], outputs: [{ type: "bool" }],
}] as const;

async function checkActivation(chainId: number) {
  const client = getClient(chainId);
  const network = chainId === 8453 ? "Base Mainnet" : "Base Sepolia";
  const [asset, stablecoin] = await Promise.all([
    client.readContract({ address: ACTIVATION_REGISTRY, abi: activationAbi, functionName: "isActivated", args: [keccak256(toBytes("base.b20_asset"))] }),
    client.readContract({ address: ACTIVATION_REGISTRY, abi: activationAbi, functionName: "isActivated", args: [keccak256(toBytes("base.b20_stablecoin"))] }),
  ]);
  return { asset, stablecoin, network };
}

// ─────────────────────────────────────────────
//  Tool execution
// ─────────────────────────────────────────────

async function runTool(id: unknown, name: string, args: Record<string, unknown>) {
  try {
    switch (name) {
      // ── Deploy ──────────────────────────────
      case "b20_encode_deploy": {
        const {
          name: tokenName,
          symbol,
          variant,
          initialAdmin,
          chainId,
          decimals,
          currency,
          grantMintRole = true,
          supplyCap,
        } = args as {
          name?: string; symbol?: string; variant?: "ASSET" | "STABLECOIN";
          initialAdmin?: string; chainId?: number; decimals?: number; currency?: string;
          grantMintRole?: boolean; supplyCap?: string;
        };

        // Ask user for any missing required inputs
        const missing: string[] = [];
        if (!tokenName) missing.push("token name (e.g. GameCoin)");
        if (!symbol) missing.push("token symbol (e.g. GC)");
        if (!variant) missing.push("variant — ASSET or STABLECOIN?");
        if (!initialAdmin) missing.push("initialAdmin wallet address");
        if (!chainId) missing.push("network — Base Mainnet (8453) or Base Sepolia (84532)?");
        if (variant === "ASSET" && decimals === undefined) missing.push("decimals (6-18, e.g. 18)");
        if (variant === "STABLECOIN" && !currency) missing.push("currency code (e.g. USD)");
        if (missing.length > 0)
          return ok(id, `Please provide the following before I can encode the deployment:\n${missing.map(m => `• ${m}`).join("\n")}`);

        if (!isAddress(initialAdmin!)) throw new Error("initialAdmin is not a valid address");

        // Check activation for the requested variant on this chain
        const activation = await checkActivation(chainId!);
        const variantActive = variant === "ASSET" ? activation.asset : activation.stablecoin;
        if (!variantActive)
          return ok(id, `⚠️ B20 ${variant} is not yet activated on ${activation.network}. Deployment will fail until Base enables it.\n\nYou can check status anytime: ask me to run b20_check_activation.`);

        const encodedParams =
          variant === "ASSET"
            ? encodeAssetCreateParams(tokenName!, symbol!, initialAdmin as Address, decimals!)
            : encodeStablecoinCreateParams(tokenName!, symbol!, initialAdmin as Address, currency!.toUpperCase());

        const tokenDecimals = variant === "STABLECOIN" ? 6 : decimals!;
        const cap = supplyCap ? BigInt(supplyCap) * 10n ** BigInt(tokenDecimals) : NO_SUPPLY_CAP;

        const initCalls: `0x${string}`[] = [];
        if (grantMintRole) initCalls.push(encodeGrantRole(MINT_ROLE, initialAdmin as Address));
        initCalls.push(encodeUpdateSupplyCap(cap));

        const salt = keccak256(toBytes(`${symbol}-${Date.now()}-${Math.random()}`));

        const deployerAddress = B20_DEPLOYER_ADDRESSES[chainId!];

        if (deployerAddress) {
          // Route through platform deployer — reads fee from contract, passes as value
          const client = getClient(chainId);
          const deployFee = await client.readContract({
            address: deployerAddress,
            abi: b20DeployerAbi,
            functionName: "deployFee",
          });

          const data = encodeFunctionData({
            abi: b20DeployerAbi,
            functionName: "deployB20Token",
            args: [B20Variant[variant!], salt, encodedParams, initCalls],
          });

          return ok(id, JSON.stringify({
            to: deployerAddress,
            data,
            value: `0x${deployFee.toString(16)}`,
            fee_eth: formatUnits(deployFee, 18),
            description: `Deploy ${variant} B20 token: ${tokenName} (${symbol}) — fee: ${formatUnits(deployFee, 18)} ETH`,
          }, null, 2));
        }

        // No deployer configured for this chain — call factory directly (no fee)
        const data = encodeFunctionData({
          abi: b20FactoryAbi,
          functionName: "createB20",
          args: [B20Variant[variant!], salt, encodedParams, initCalls],
        });

        return ok(id, JSON.stringify({
          to: B20_FACTORY_ADDRESS,
          data,
          value: "0x0",
          description: `Deploy ${variant} B20 token: ${tokenName} (${symbol})`,
        }, null, 2));
      }

      // ── Mint ────────────────────────────────
      case "b20_encode_mint": {
        const { tokenAddress, to, amount, decimals, chainId } = args as {
          tokenAddress?: string; to?: string; amount?: string; decimals?: number; chainId?: number;
        };
        const askMint = askMissing(id, [
          { label: "token contract address", value: tokenAddress },
          { label: "recipient wallet address", value: to },
          { label: "amount (e.g. 1000)", value: amount },
          { label: "token decimals (e.g. 18)", value: decimals },
          { label: "network — Base Mainnet (8453) or Base Sepolia (84532)?", value: chainId },
        ]);
        if (askMint) return askMint;
        if (!isAddress(tokenAddress!)) throw new Error("Invalid tokenAddress");
        if (!isAddress(to!)) throw new Error("Invalid to address");

        // Check activation before encoding — mint will fail on-chain if not active
        const activation = await checkActivation(chainId!);
        if (!activation.asset && !activation.stablecoin)
          return ok(id, `⚠️ B20 is not yet activated on ${activation.network}. Minting will fail until Base enables it.\n\nCheck status: ask me to run b20_check_activation.`);

        const data = encodeFunctionData({
          abi: b20TokenAbi,
          functionName: "mint",
          args: [to! as Address, parseUnits(amount!, decimals!)],
        });

        return ok(id, JSON.stringify({ to: tokenAddress, data, value: "0x0" }, null, 2));
      }

      // ── Payment ─────────────────────────────
      case "b20_encode_payment": {
        const { tokenAddress, to, amount, decimals, memo = "" } = args as {
          tokenAddress?: string; to?: string; amount?: string; decimals?: number; memo?: string;
        };
        const askPay = askMissing(id, [
          { label: "token contract address", value: tokenAddress },
          { label: "recipient wallet address", value: to },
          { label: "amount (e.g. 100)", value: amount },
          { label: "token decimals (e.g. 18)", value: decimals },
        ]);
        if (askPay) return askPay;
        if (!isAddress(tokenAddress!)) throw new Error("Invalid tokenAddress");
        if (!isAddress(to!)) throw new Error("Invalid to address");
        if (memo.length > 32) throw new Error("Memo exceeds 32 bytes");

        const data = encodeFunctionData({
          abi: b20TokenAbi,
          functionName: "transferWithMemo",
          args: [to! as Address, parseUnits(amount!, decimals!), stringToHex(memo, { size: 32 })],
        });

        return ok(id, JSON.stringify({ to: tokenAddress, data, value: "0x0", memo }, null, 2));
      }

      // ── Grant MINT_ROLE ─────────────────────
      case "b20_encode_grant_mint_role": {
        const { tokenAddress, account } = args as { tokenAddress?: string; account?: string };
        const askGrant = askMissing(id, [
          { label: "token contract address", value: tokenAddress },
          { label: "wallet address to grant MINT_ROLE to", value: account },
        ]);
        if (askGrant) return askGrant;
        if (!isAddress(tokenAddress!)) throw new Error("Invalid tokenAddress");
        if (!isAddress(account!)) throw new Error("Invalid account");

        const data = encodeGrantRole(MINT_ROLE, account! as Address);
        return ok(id, JSON.stringify({ to: tokenAddress, data, value: "0x0" }, null, 2));
      }

      // ── Read token ──────────────────────────
      case "b20_read_token": {
        const { tokenAddress, chainId = 8453, checkMintRole } = args as {
          tokenAddress: string; chainId?: number; checkMintRole?: string;
        };
        if (!isAddress(tokenAddress)) throw new Error("Invalid tokenAddress");

        const client = getClient(chainId);
        const addr = tokenAddress as Address;

        const [nameRes, symbolRes, decimalsRes, supplyRes, capRes] = await Promise.all([
          client.readContract({ address: addr, abi: b20TokenAbi, functionName: "name" }),
          client.readContract({ address: addr, abi: b20TokenAbi, functionName: "symbol" }),
          client.readContract({ address: addr, abi: b20TokenAbi, functionName: "decimals" }),
          client.readContract({ address: addr, abi: b20TokenAbi, functionName: "totalSupply" }),
          client.readContract({ address: addr, abi: b20TokenAbi, functionName: "supplyCap" }),
        ]);

        const dec = Number(decimalsRes);
        const isUnlimited = capRes === NO_SUPPLY_CAP;

        let hasMintRole: boolean | null = null;
        if (checkMintRole && isAddress(checkMintRole)) {
          hasMintRole = await client.readContract({
            address: addr, abi: b20TokenAbi, functionName: "hasRole",
            args: [MINT_ROLE, checkMintRole as Address],
          });
        }

        return ok(id, JSON.stringify({
          name: nameRes,
          symbol: symbolRes,
          decimals: dec,
          totalSupply: formatUnits(supplyRes, dec),
          supplyCap: isUnlimited ? "unlimited" : formatUnits(capRes, dec),
          network: chainId === 8453 ? "Base Mainnet" : "Base Sepolia",
          ...(hasMintRole !== null ? { hasMintRole } : {}),
        }, null, 2));
      }

      // ── Activation check ────────────────────
      case "b20_check_activation": {
        const { chainId = 8453 } = args as { chainId?: number };
        const client = getClient(chainId);

        const REGISTRY = "0x8453000000000000000000000000000000000001" as Address;
        const abi = [{
          type: "function", name: "isActivated", stateMutability: "view",
          inputs: [{ name: "id", type: "bytes32" }], outputs: [{ type: "bool" }],
        }] as const;

        const [asset, stablecoin] = await Promise.all([
          client.readContract({ address: REGISTRY, abi, functionName: "isActivated", args: [keccak256(toBytes("base.b20_asset"))] }),
          client.readContract({ address: REGISTRY, abi, functionName: "isActivated", args: [keccak256(toBytes("base.b20_stablecoin"))] }),
        ]);

        return ok(id, JSON.stringify({
          network: chainId === 8453 ? "Base Mainnet" : "Base Sepolia",
          asset_activated: asset,
          stablecoin_activated: stablecoin,
          status: asset && stablecoin ? "Both activated — ready to deploy" : "Not yet fully activated",
        }, null, 2));
      }

      default:
        return fail(id, `Unknown tool: ${name}`);
    }
  } catch (err) {
    return fail(id, `Error: ${err instanceof Error ? err.message : String(err)}`);
  }
}

// ─────────────────────────────────────────────
//  MCP JSON-RPC handler
// ─────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleRequest(body: any) {
  const { jsonrpc = "2.0", method, id, params } = body;

  switch (method) {
    case "initialize":
      return {
        jsonrpc, id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: { tools: {} },
          serverInfo: { name: "b20", version: "1.0.0" },
        },
      };

    case "ping":
      return { jsonrpc, id, result: {} };

    case "tools/list":
      return { jsonrpc, id, result: { tools: TOOLS } };

    case "tools/call":
      return runTool(id, params?.name, params?.arguments ?? {});

    case "notifications/initialized":
    case "notifications/cancelled":
      return null;

    default:
      return { jsonrpc, id, error: { code: -32601, message: "Method not found" } };
  }
}

// ─────────────────────────────────────────────
//  Route handlers
// ─────────────────────────────────────────────

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET() {
  return NextResponse.json(
    { name: "B20 MCP Server", version: "1.0.0", tools: TOOLS.map((t) => t.name) },
    { headers: CORS },
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (Array.isArray(body)) {
    const responses = await Promise.all(body.map(handleRequest));
    return NextResponse.json(responses.filter(Boolean), { headers: CORS });
  }

  const response = await handleRequest(body);
  if (response === null) return new NextResponse(null, { status: 204, headers: CORS });
  return NextResponse.json(response, { headers: CORS });
}
