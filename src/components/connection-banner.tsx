type Props = {
  readonly connected: boolean;
};

/**
 * Banner displayed at the top of the dashboard indicating whether the GitHub
 * service layer has a credential. Honest about Phase 0 manual blockers so
 * the dashboard never pretends to have data it does not have.
 */
export function ConnectionBanner({ connected }: Props): JSX.Element {
  if (connected) {
    return (
      <div
        className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        role="status"
        aria-live="polite"
      >
        GitHub service layer connected. Live PR and check signals are active.
      </div>
    );
  }
  return (
    <div
      className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
      role="status"
      aria-live="polite"
    >
      <strong className="font-semibold">Not connected.</strong>{" "}
      <code className="font-mono">GITHUB_TOKEN</code> is not set. Showing the static portfolio
      registry only. Per <code className="font-mono">docs/INTEGRATION_MAP.md</code>, this
      credential lives in the deployed environment&rsquo;s encrypted secret store, never in code.
    </div>
  );
}
