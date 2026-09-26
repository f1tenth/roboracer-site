import Button from "../ui/Button";

const SLACK_URL =
  "https://join.slack.com/t/robo-racer/shared_invite/zt-47c2yt7if-BGnqzoPjipFh1HwiDazE3Q";

type NewsEmptyProps = {
  /** "empty" = the file holds no item; "error" = the file did not load. */
  variant?: "empty" | "error";
  id?: string;
};

/**
 * What stands in for the feed when there is nothing to show. It should stay
 * unreachable with the current data; it exists so a failed fetch or an empty
 * file never leaves a blank column.
 */
export default function NewsEmpty({ variant = "empty", id }: NewsEmptyProps) {
  const title = variant === "error" ? "The feed did not load" : "No news yet";
  const body =
    variant === "error"
      ? "Reload the page to try again. Race news is posted in the RoboRacer Slack first."
      : "Race news is posted in the RoboRacer Slack first.";
  return (
    <div className="rounded-card border border-ink-950/10 bg-paper-100 p-8 md:p-12">
      <p className="mb-4 flex items-center gap-2 font-mono text-small text-text-muted">
        <span aria-hidden="true" className="h-1 w-1 bg-ink-950" />
        <span>Feed</span>
      </p>
      <h2 id={id} className="font-display text-display-m font-semibold text-text-strong">
        {title}
      </h2>
      <p className="mt-4 max-w-[52ch] text-lead text-text-body">{body}</p>
      <div className="mt-8">
        <Button href={SLACK_URL} variant="secondary" target="_blank" rel="noopener noreferrer">
          Open the RoboRacer Slack
        </Button>
      </div>
    </div>
  );
}
