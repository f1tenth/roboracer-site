import Button from "./Button";

type SponsorCTAProps = {
  on?: "paper" | "ink";
};

/**
 * Zero sponsors is the correct current state: a hairline panel with the one
 * call to action, no empty tier rows, no filled feature box.
 */
export default function SponsorCTA({ on = "paper" }: SponsorCTAProps) {
  const ink = on === "ink";
  return (
    <div
      className={`grid gap-8 rounded-card border p-8 md:grid-cols-12 md:p-10 ${ink ? "border-text-on-ink/15" : "border-ink-950/10"}`}
    >
      <div className="md:col-span-7">
        <h3 className={`font-display text-display-m font-semibold ${ink ? "text-text-on-ink" : "text-text-strong"}`}>
          Sponsor a RoboRacer competition
        </h3>
        <p className={`mt-4 max-w-[55ch] text-body ${ink ? "text-text-on-ink-muted" : "text-text-body"}`}>
          RoboRacer races run at the major robotics conferences, in front of the
          students, labs and companies working on autonomous driving. Back the
          next competition and reach them directly.
        </p>
      </div>
      <div className="flex items-end md:col-span-5 md:justify-end">
        <Button href="mailto:contact@roboracer.ai?subject=RoboRacer%20sponsorship" on={on} variant="primary">
          Become a sponsor
        </Button>
      </div>
      {/* TODO(content): link the Sponsorship Flyer PDF once Cedric approves the Drive export. */}
    </div>
  );
}
