"use client";

import { useMemo, useState } from "react";
import { hexToString, isHash, parseEventLogs, type Hash } from "viem";
import { useTransactionReceipt } from "wagmi";
import { b20TokenAbi } from "@/lib/b20";

function decodeMemo(memo: `0x${string}`): string {
  try {
    const text = hexToString(memo, { size: 32 });
    // Fall back to raw hex if it decodes to something unprintable/empty.
    return /^[\x20-\x7E]*$/.test(text) && text.length > 0 ? text : memo;
  } catch {
    return memo;
  }
}

export function CheckMemoPanel() {
  const [txHash, setTxHash] = useState("");
  const isValidHash = isHash(txHash);

  const {
    data: receipt,
    isLoading,
    isError,
  } = useTransactionReceipt({
    hash: isValidHash ? (txHash as Hash) : undefined,
    query: { enabled: isValidHash },
  });

  const memoLogs = useMemo(() => {
    if (!receipt) return [];
    try {
      return parseEventLogs({ abi: b20TokenAbi, logs: receipt.logs, eventName: "Memo" });
    } catch {
      return [];
    }
  }, [receipt]);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5">
      <label className="flex flex-col gap-1 text-sm text-foreground">
        Transaction hash
        <input
          value={txHash}
          onChange={(e) => setTxHash(e.target.value.trim())}
          placeholder="0x..."
          className="rounded-lg border border-zinc-200 px-3 py-2 font-mono text-xs focus:border-primary focus:outline-none"
        />
      </label>

      {txHash && !isValidHash && (
        <p className="text-xs text-red-600">That doesn&apos;t look like a valid transaction hash.</p>
      )}

      {isValidHash && isLoading && <p className="text-sm text-zinc-500">Looking up transaction...</p>}

      {isValidHash && isError && !isLoading && (
        <p className="text-sm text-red-600">
          Couldn&apos;t find that transaction. Double-check the hash and that it&apos;s on the right network.
        </p>
      )}

      {receipt && memoLogs.length === 0 && (
        <p className="text-sm text-zinc-500">
          This transaction doesn&apos;t contain a Memo event — it wasn&apos;t sent with transferWithMemo (or a similar
          memo&apos;d call).
        </p>
      )}

      {memoLogs.map((log, i) => (
        <div key={i} className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-3">
          <div className="text-xs text-zinc-500">Token contract</div>
          <div className="break-all font-mono text-xs text-foreground">{log.address}</div>
          <div className="text-xs text-zinc-500">Sent by</div>
          <div className="break-all font-mono text-xs text-foreground">{log.args.caller}</div>
          <div className="text-xs text-zinc-500">Memo</div>
          <div className="break-all font-mono text-sm font-medium text-foreground">
            {decodeMemo(log.args.memo)}
          </div>
        </div>
      ))}
    </div>
  );
}
