import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center section-padding">
      <div className="text-center max-w-lg">
        <p className="font-mono-label text-[11px] text-orange mb-4">
          ERROR 404 // TELEMETRY LOST
        </p>
        <h1 className="font-display text-5xl md:text-6xl font-bold mb-4">
          SIGNAL LOST
        </h1>
        <p className="text-muted mb-8">
          That resource is not in the TRAIC system database. It may have been
          unpublished, renamed, or never existed.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <ButtonLink href="/">RETURN TO BASE</ButtonLink>
          <ButtonLink href="/projects" variant="outline">
            BROWSE PROJECTS
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
