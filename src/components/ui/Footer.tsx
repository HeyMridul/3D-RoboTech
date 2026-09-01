import Link from "next/link";
import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="relative border-t border-card-border bg-charcoal">
      <div className="absolute inset-0 traic-grid traic-grid-fade opacity-20 pointer-events-none" />
      <div className="container-traic section-padding relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <h3 className="font-display text-2xl font-bold mb-2">TRAIC</h3>
            <p className="font-mono-label text-muted text-[11px] mb-4">
              Robotics & Innovation Club
            </p>
            <div className="space-y-1 font-display text-sm text-muted">
              <p>BUILD.</p>
              <p>EXPERIMENT.</p>
              <p>INNOVATE.</p>
            </div>
          </div>

          <div>
            <p className="font-mono-label text-cyan mb-4">NAVIGATE</p>
            <ul className="space-y-2">
              {["Projects", "Events", "Workshops", "Members", "Achievements", "Join"].map(
                (item) => (
                  <li key={item}>
                    <Link
                      href={`/${item.toLowerCase()}`}
                      className="text-muted hover:text-cyan text-sm transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </div>

          <div>
            <p className="font-mono-label text-cyan mb-4">CONNECT</p>
            <ul className="space-y-2">
              {Object.entries(siteConfig.social).map(([key, url]) => (
                <li key={key}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted hover:text-cyan text-sm capitalize transition-colors"
                  >
                    {key}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-card-border flex flex-col sm:flex-row justify-between gap-4">
          <p className="font-mono-label text-[10px] text-muted">
            © {new Date().getFullYear()} TRAIC — Robotics & Innovation Club
          </p>
          <p className="font-mono-label text-[10px] text-muted">
            LAT {siteConfig.location.lat}{" // "}LON {siteConfig.location.lon}
          </p>
        </div>
      </div>
    </footer>
  );
}
