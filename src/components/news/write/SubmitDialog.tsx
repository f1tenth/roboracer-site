import { useEffect, useMemo, useRef, useState } from "react";
import { buttonClasses } from "../../ui/buttonStyles";
import { IconArrow, IconCheck } from "./WriterIcons";
import {
  MAIL_TO,
  REPO_NAME,
  buildPackage,
  buildPost,
  forkUrl,
  githubUserFrom,
  isGithubUser,
  mailUrl,
  uploadUrl,
  usedImageIds,
  type BuiltPackage,
  type Issue,
} from "./package";
import type { Draft, DraftImage } from "./types";

const LINK =
  "text-text-strong underline decoration-ink-950/25 underline-offset-4 hover:decoration-rr-violet hover:decoration-2";

const kb = (bytes: number) => (bytes >= 1_000_000 ? `${(bytes / 1_000_000).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1000))} kB`);

function Step({ n, done, title, children }: { n: number; done: boolean; title: string; children: React.ReactNode }) {
  return (
    <li className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-4">
      <span
        aria-hidden="true"
        className={`flex h-9 w-9 items-center justify-center rounded-pill font-mono text-small ${
          done ? "bg-rr-violet text-white" : "border border-ink-950/20 text-text-strong"
        }`}
      >
        {done ? <IconCheck /> : n}
      </span>
      <div className="min-w-0 pb-1">
        <h3 className="pt-1.5 font-display text-[1.125rem] font-semibold leading-snug text-text-strong">{title}</h3>
        <div className="mt-2 text-small text-text-body">{children}</div>
      </div>
    </li>
  );
}

/**
 * Sending a post. The site has no server, on purpose: nothing here can be
 * attacked, flooded or tricked into writing to the repository. The writer
 * downloads the post as one file and proposes it from their own GitHub
 * account (a pull request into the quarantined submissions/ folder), or
 * emails the file. Either way a maintainer reads it before anything is
 * published.
 */
export default function SubmitDialog({
  open,
  onClose,
  draft,
  images,
  errors,
  notes,
  words,
  onGoTo,
}: {
  open: boolean;
  onClose: () => void;
  draft: Pick<Draft, "meta" | "doc">;
  images: ReadonlyMap<string, DraftImage>;
  errors: Issue[];
  notes: Issue[];
  words: number;
  /** Close and take the writer to the field that needs them. */
  onGoTo: (target: string) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [consent, setConsent] = useState(false);
  const [built, setBuilt] = useState<BuiltPackage | null>(null);
  const [working, setWorking] = useState(false);
  const [failure, setFailure] = useState("");
  const [opened, setOpened] = useState(false);
  // Until the writer types one, the username is read from their own page
  // when that is a GitHub profile: they have already told us.
  const [typedUser, setUser] = useState<string | null>(null);
  const user = typedUser ?? githubUserFrom(draft.meta.authorUrl);
  const userOk = isGithubUser(user);
  const ready = !!built && userOk;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      // A fresh look every time: the draft may have changed since.
      setBuilt(null);
      setFailure("");
      setOpened(false);
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const download = async () => {
    setWorking(true);
    setFailure("");
    try {
      const pack = await buildPackage(draft, images);
      const url = URL.createObjectURL(pack.zip);
      const a = document.createElement("a");
      a.href = url;
      a.download = pack.fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      setBuilt(pack);
    } catch (err) {
      setFailure(err instanceof Error ? err.message : "The post could not be packed. Try again.");
    } finally {
      setWorking(false);
    }
  };

  const pictures = usedImageIds(draft).filter((id) => images.has(id)).length;
  // What the post format could not keep exactly as written (rare: emphasis
  // in a spot Markdown cannot express). Worked out only while the box is open.
  const lost = useMemo(() => (open ? buildPost(draft, images).problems : []), [open, draft, images]);
  const blocked = errors.length > 0;

  return (
    <dialog
      ref={ref}
      aria-labelledby="send-title"
      onClose={onClose}
      onClick={(e) => {
        // A press on the dimmed page around the box closes it.
        if (e.target === ref.current) onClose();
      }}
      className="m-auto max-h-[calc(100svh-2rem)] w-[min(44rem,calc(100vw-2rem))] overflow-y-auto rounded-[0.75rem] border border-ink-950/10 bg-paper-50 p-0 text-text-body shadow-card-hover backdrop:bg-ink-950/60"
    >
      {/* The gradient rule the site's cards carry. */}
      <div
        aria-hidden="true"
        className="h-0.5 bg-[linear-gradient(90deg,var(--color-rr-cyan),var(--color-rr-grad-start),var(--color-rr-grad-end))]"
      />
      <div className="p-6 pt-7 sm:p-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="mb-3 flex items-center gap-2 font-mono text-small text-text-muted">
              <span aria-hidden="true" className="h-1 w-1 bg-ink-950" />
              <span>Send your post</span>
            </p>
            <h2 id="send-title" className="font-display text-display-s font-semibold text-text-strong">
              {blocked ? "Almost there" : "Ready to send"}
            </h2>
          </div>
          <button type="button" onClick={onClose} className={`${LINK} shrink-0 cursor-pointer font-mono text-small coarse:min-h-11`}>
            Close
          </button>
        </div>

        {blocked ? (
          <>
            <p className="mt-4 max-w-[56ch]">
              {errors.length === 1 ? "One thing is" : `${errors.length} things are`} still missing. Each line takes you to it.
            </p>
            <ul className="mt-5 divide-y divide-ink-950/10 border-y border-ink-950/10">
              {errors.map((issue, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => onGoTo(issue.target)}
                    className="group flex w-full cursor-pointer items-center justify-between gap-4 py-3 text-left text-text-strong coarse:min-h-11"
                  >
                    <span>{issue.message}</span>
                    <span aria-hidden="true" className="shrink-0 text-text-muted transition-colors group-hover:text-rr-violet">
                      <IconArrow />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <p className="mt-4 font-mono text-small text-text-muted">
              {words} words · {pictures} {pictures === 1 ? "picture" : "pictures"}
              {built ? ` · ${kb(built.zip.size)}` : ""}
            </p>
            {notes.length + lost.length > 0 && (
              <ul className="mt-3 grid gap-1 text-small text-text-muted">
                {[...notes.map((note) => note.message), ...lost].map((message, i) => (
                  <li key={i} className="flex gap-2">
                    <span aria-hidden="true">·</span>
                    <span>{message}</span>
                  </li>
                ))}
              </ul>
            )}

            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-media border border-ink-950/10 bg-rr-violet/[0.04] p-4 text-small text-text-strong">
              <span className="relative mt-0.5 h-5 w-5 shrink-0">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="peer block h-5 w-5 cursor-pointer appearance-none rounded-[3px] border border-ink-950/35 bg-paper-50 transition-colors duration-[var(--duration-fast)] checked:border-rr-violet checked:bg-rr-violet motion-reduce:transition-none forced-colors:appearance-auto"
                />
                <span aria-hidden="true" className="pointer-events-none absolute inset-0 hidden items-center justify-center text-white peer-checked:flex forced-colors:hidden">
                  <IconCheck />
                </span>
              </span>
              <span>
                These are my own words and pictures, or I have permission to publish them, and RoboRacer may publish them on
                roboracer.ai under my name.
              </span>
            </label>

            <ol className="mt-7 grid gap-6">
              <Step n={1} done={!!built} title="Download your post">
                <p className="max-w-[54ch]">One file with your text and pictures, exactly as previewed. Nothing has left this browser yet.</p>
                <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <button
                    type="button"
                    onClick={() => void download()}
                    disabled={!consent || working}
                    className={`${buttonClasses(built ? "secondary" : "primary", "paper", "sm")} cursor-pointer disabled:cursor-default disabled:opacity-40`}
                  >
                    {working ? "Packing..." : built ? "Download again" : "Download the post"}
                  </button>
                  {built && <span className="font-mono text-small text-text-muted">{built.fileName}</span>}
                  {!consent && <span className="text-small text-text-muted">Tick the box above first.</span>}
                </p>
                {failure && (
                  <p role="alert" className="mt-2 text-rr-magenta-deep">
                    {failure}
                  </p>
                )}
              </Step>

              <Step n={2} done={opened} title="Propose it on GitHub">
                <p className="max-w-[58ch]">
                  A pull request from your own GitHub account: you keep the credit, and you can follow the review.
                </p>
                <label htmlFor="send-github-user" className="mt-4 grid max-w-[22rem] gap-1">
                  <span className="font-mono text-eyebrow uppercase tracking-[0.14em] text-text-muted">Your GitHub username</span>
                  <input
                    id="send-github-user"
                    type="text"
                    value={user}
                    onChange={(e) => setUser(e.target.value.trim().replace(/^@/, ""))}
                    placeholder="octocat"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    maxLength={39}
                    aria-invalid={(user !== "" && !userOk) || undefined}
                    className="w-full border-b border-ink-950/20 bg-transparent py-1.5 font-mono text-body text-text-strong placeholder:text-text-muted/70 focus:border-rr-violet focus:outline-none aria-[invalid=true]:border-rr-magenta-deep"
                  />
                </label>
                <ol className="mt-4 grid max-w-[58ch] list-decimal gap-2.5 pl-5 marker:font-mono marker:text-text-muted">
                  <li>
                    <a href={forkUrl()} target="_blank" rel="noopener noreferrer" className={LINK}>
                      Make your own copy of the repository
                    </a>{" "}
                    (a fork). If you already have one, open it and press{" "}
                    <strong className="font-semibold text-text-strong">Sync fork</strong>.
                  </li>
                  <li>
                    Unzip the file you downloaded, open your upload page, and drag the unzipped folder onto it.
                  </li>
                  <li>
                    Under the files, pick{" "}
                    <strong className="font-semibold text-text-strong">Create a new branch for this commit and start a pull request</strong>,
                    press <strong className="font-semibold text-text-strong">Propose changes</strong>, then{" "}
                    <strong className="font-semibold text-text-strong">Create pull request</strong>.
                  </li>
                </ol>
                <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <a
                    href={ready ? uploadUrl(user) : undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-disabled={!ready}
                    onClick={() => ready && setOpened(true)}
                    className={`${buttonClasses(ready && !opened ? "primary" : "secondary", "paper", "sm")} ${ready ? "" : "pointer-events-none opacity-40"}`}
                  >
                    Open your upload page
                  </a>
                  <span className="font-mono text-small text-text-muted">
                    {!built ? "Download the post first." : !userOk ? "Type your username above." : `github.com/${user}/${REPO_NAME}`}
                  </span>
                </p>
                <p className="mt-4 max-w-[58ch] text-text-muted">
                  No GitHub account?{" "}
                  <a href={mailUrl(draft.meta.title.trim() || "a post")} className={LINK}>
                    Email the file
                  </a>{" "}
                  to {MAIL_TO} instead.
                </p>
              </Step>

              <Step n={3} done={false} title="We read it and publish it">
                <p className="max-w-[58ch]">
                  A maintainer reads every post before it goes on the news page, and may suggest edits on the pull request. Your
                  draft stays in this browser until you start over.
                </p>
              </Step>
            </ol>
          </>
        )}
      </div>
    </dialog>
  );
}
