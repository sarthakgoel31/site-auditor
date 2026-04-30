export function Footer() {
  return (
    <footer className="border-t border-border px-4 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
            SA
          </div>
          <span className="text-sm font-semibold">Site Auditor</span>
        </div>
        <p className="text-sm text-muted">
          Built by{" "}
          <a
            href="https://sarthakgoel.cv"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent transition-colors hover:text-accent-light"
          >
            Sarthak Goel
          </a>
        </p>
        <p className="text-xs text-zinc-600">
          Free. Open source. No tracking. No sign-up.
        </p>
      </div>
    </footer>
  );
}
