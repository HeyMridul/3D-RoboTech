/**
 * Shared route loading indicator.
 *
 * Deliberately not placed at `app/loading.tsx`. A root loading boundary wraps
 * every route in Suspense, which flushes a 200 before a detail page can call
 * notFound() — turning every missing project, member, event, workshop and post
 * into a soft 404 that search engines index as a real page. Use this only in
 * leaf segments that have no dynamic children, or inside an explicit
 * <Suspense> below the point where notFound() is decided.
 */
export function LoadingState({ label = "LOADING SYSTEM DATA" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-[60vh] flex flex-col items-center justify-center gap-4"
    >
      <p className="font-mono-label text-[11px] text-cyan">{label}</p>
      <div className="w-56 h-px bg-card-border overflow-hidden">
        <div className="h-full w-1/3 bg-cyan animate-sweep" />
      </div>
      <span className="sr-only">Loading</span>
    </div>
  );
}

/** Card placeholder for grids that stream in. */
export function CardSkeleton() {
  return (
    <div className="border border-card-border bg-card overflow-hidden">
      <div className="aspect-video bg-graphite animate-pulse" />
      <div className="p-6 space-y-3">
        <div className="h-3 w-24 bg-graphite animate-pulse" />
        <div className="h-5 w-3/4 bg-graphite animate-pulse" />
        <div className="h-3 w-full bg-graphite animate-pulse" />
      </div>
    </div>
  );
}
