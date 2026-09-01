interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="border border-card-border bg-card p-12 md:p-16 text-center">
      <p className="font-mono-label text-cyan mb-3">SYSTEM NOTICE</p>
      <p className="font-display text-2xl font-semibold mb-2">{title}</p>
      {description && <p className="text-muted text-sm max-w-md mx-auto">{description}</p>}
    </div>
  );
}
