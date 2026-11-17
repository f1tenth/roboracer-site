/**
 * A title with its accent words in the logo gradient: one display phrase per
 * page (the course pages' rule), and only if the title contains the words.
 * The post page's h1 and that post's lead headline on /news share it, so the
 * name reads the same in both places.
 */
export default function AccentTitle({ title, accent }: { title: string; accent?: string | null }) {
  const at = accent ? title.indexOf(accent) : -1;
  if (!accent || at < 0) return <>{title}</>;
  return (
    <>
      {title.slice(0, at)}
      <span className="text-gradient-logo -my-[0.15em] inline-block py-[0.15em]">{accent}</span>
      {title.slice(at + accent.length)}
    </>
  );
}
