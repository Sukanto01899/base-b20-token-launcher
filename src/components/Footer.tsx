export function Footer() {
  return (
    <footer className="border-t border-primary bg-primary px-6 py-4 text-center text-sm text-white">
      Built by{" "}
      <a
        href="https://x.com/sukanto018"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 font-medium text-white underline hover:text-white/80"
      >
        Sukanto
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5 fill-current">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>
      {" · "}
      <a
        href="/mcp"
        className="text-white underline hover:text-white/80"
      >
        B20 MCP
      </a>
      {" · "}
      <a
        href="https://docs.base.org/get-started/launch-b20-token"
        target="_blank"
        rel="noopener noreferrer"
        className="text-white underline hover:text-white/80"
      >
        Base B20 docs
      </a>
    </footer>
  );
}
