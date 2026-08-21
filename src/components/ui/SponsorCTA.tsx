import Button from "./Button";

type SponsorCTAProps = {
  on?: "ink" | "paper";
};

/**
 * Zero sponsors is the correct current state (Cedric, 2026-08-20): this
 * section replaces empty tier rows with a single call to action. Tiers
 * activate once a sponsor is confirmed (roboracer-content).
 */
export default function SponsorCTA({ on = "ink" }: SponsorCTAProps) {
  const ink = on === "ink";
  return (
    <div
      className={
        ink
          ? "rounded-card border border-ink-700 bg-ink-800 p-10 text-center"
          : "rounded-card bg-paper-100 p-10 text-center"
      }
    >
      <p className="eyebrow mb-3 text-rr-magenta">Sponsorship</p>
      <h3 className={`font-display text-display-m font-semibold ${ink ? "text-text-on-ink" : "text-text-strong"}`}>
        Put your name on the grid
      </h3>
      <p className={`mx-auto mt-4 max-w-[60ch] text-lead ${ink ? "text-text-on-ink-muted" : "text-text-body"}`}>
        RoboRacer races run at the major robotics conferences, with teams from
        90+ universities. Back the next competition and reach them directly.
      </p>
      <div className="mt-8 flex justify-center">
        <Button
          href="mailto:contact@roboracer.ai?subject=RoboRacer%20sponsorship"
          on={on}
          variant="primary"
        >
          Become a sponsor
        </Button>
      </div>
      {/* TODO(content): link the Sponsorship Flyer PDF once Cedric approves the Drive export. */}
    </div>
  );
}
