# B20 Token Launcher

Deploy and mint [B20 tokens](https://docs.base.org/get-started/launch-b20-token) on Base Sepolia in one click. Everything signs client-side through your own wallet (RainbowKit + wagmi + viem) — there's no backend and no private keys ever touch a server.

**Live site:** [TODO: add deployed URL here]

## How to use it

1. Open the site and click **Connect Wallet** (top right) — pick your wallet, or scan the QR code with a mobile wallet.
2. Make sure you're on **Base Sepolia** — the app will prompt you to switch if you're on the wrong network.
3. Use the **Deploy B20 / Mint Tokens** switcher (left side) to pick what you want to do:
   - **Deploy B20** — choose ASSET or STABLECOIN, fill in name/symbol/decimals (or currency code), optionally check "Grant myself MINT_ROLE" and set a supply cap, then hit **Deploy B20 Token**. Confirm the transaction in your wallet. Your deployed token is remembered in this browser for next time.
   - **Mint Tokens** — pick a token you've deployed (or paste any token address), see how much has been minted and its cap, enter an amount, and hit **Mint**. If you don't have `MINT_ROLE` but you do hold the token's admin role, the app lets you grant `MINT_ROLE` to any address right there.
4. Tap the **?** icons or the FAQ accordion at the bottom if anything ("MINT_ROLE", "supply cap", "B20" itself) isn't clear.

See the [repo-level README](../README.md) for the Foundry CLI scripts behind this app, and [src/lib/b20.ts](src/lib/b20.ts) if you're extending the on-chain encoding.
