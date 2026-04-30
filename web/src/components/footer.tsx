export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-16">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 text-center">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-base font-bold text-white">
            SA
          </div>
          <span className="text-lg font-bold">Site Auditor</span>
        </div>
        <p className="text-[15px] text-muted">
          Built by{" "}
          <a
            href="https://sarthakgoel.cv"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-accent transition-colors hover:text-accent-light"
          >
            Sarthak Goel
          </a>
        </p>
        <p className="text-sm text-zinc-600">
          Free. Open source. No tracking. No sign-up.
        </p>
      </div>
    </footer>
  );
}
