import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FHE-EPMC — Production Management Centre",
  description:
    "GitHub-native, evidence-led, human-gated enterprise delivery management for Future Horizons Education.",
  robots: { index: false, follow: false },
};

/**
 * Root layout for the FHE-EPMC dashboard. Server Component by default; no
 * client-side state, no analytics, no third-party fonts.
 */
export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-ink-200 bg-white">
            <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-ink-400">
                  Future Horizons Education
                </p>
                <h1 className="text-lg font-semibold text-ink-900">
                  Enterprise Production Management Centre
                </h1>
              </div>
              <nav aria-label="Primary" className="text-sm text-ink-500">
                <ol className="flex items-center gap-4">
                  <li>
                    <a className="hover:text-ink-900" href="/" aria-label="Portfolio overview">
                      Portfolio
                    </a>
                  </li>
                </ol>
              </nav>
            </div>
          </header>
          <main className="flex-1">
            <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
          </main>
          <footer className="border-t border-ink-200 bg-white">
            <div className="mx-auto max-w-6xl px-6 py-4 text-xs text-ink-400">
              FHE-EPMC · Phase 1 Live Control Tower MVP · Human-gated · No simulated state.
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
