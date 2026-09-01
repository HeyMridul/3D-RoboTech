/**
 * The `//` divider used throughout TRAIC's technical readouts.
 *
 * A component rather than literal text for two reasons: a bare `//` at the
 * start of a JSX text node reads as a comment (both to humans and to
 * react/jsx-no-comment-textnodes), and it is purely decorative, so it is
 * hidden from assistive technology instead of being announced as
 * "slash slash" between every value.
 */
export function Sep({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`text-muted/60 ${className}`}>
      {" // "}
    </span>
  );
}
