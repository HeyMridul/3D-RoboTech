import Link from "next/link";
import { siteConfig } from "@/config/site";
import { brandIcons, type BrandIconName } from "@/components/ui/BrandIcons";

const EXPLORE = [
  { label: "Projects", href: "/projects" },
  { label: "Events", href: "/events" },
  { label: "Workshops", href: "/workshops" },
  { label: "Members", href: "/members" },
  { label: "Achievements", href: "/achievements" },
  { label: "Gallery", href: "/gallery" },
];

const CLUB = [
  { label: "About", href: "/about" },
  { label: "The Lab", href: "/lab" },
  { label: "Build Logs", href: "/blog" },
  { label: "Join TRAIC", href: "/join" },
  { label: "Contact", href: "/contact" },
];

export function Footer() {
  return (
    <footer className="relative border-t border-card-border bg-charcoal">
      <div
        className="absolute inset-0 traic-grid traic-grid-fade opacity-20 pointer-events-none"
        aria-hidden="true"
      />
      <div className="container-traic section-padding relative">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2">
            <h2 className="font-display text-2xl font-bold mb-2">TRAIC</h2>
            <p className="font-mono-label text-muted text-[11px] mb-5">
              Robotics &amp; Innovation Club
            </p>
            <p className="space-y-1 font-display text-sm text-metallic">
              <span className="block">BUILD.</span>
              <span className="block">EXPERIMENT.</span>
              <span className="block">INNOVATE.</span>
            </p>
          </div>

          <nav aria-labelledby="footer-explore">
            <h3
              id="footer-explore"
              className="font-mono-label text-[10px] text-cyan mb-4"
            >
              EXPLORE
            </h3>
            <ul className="space-y-2">
              {EXPLORE.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-muted hover:text-cyan text-sm transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-club">
            <h3
              id="footer-club"
              className="font-mono-label text-[10px] text-cyan mb-4"
            >
              CLUB
            </h3>
            <ul className="space-y-2">
              {CLUB.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-muted hover:text-cyan text-sm transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-connect">
            <h3
              id="footer-connect"
              className="font-mono-label text-[10px] text-cyan mb-4"
            >
              CONNECT
            </h3>
            <ul className="space-y-2">
              {Object.entries(siteConfig.social).map(([key, url]) => {
                const Icon = brandIcons[key as BrandIconName];
                return (
                  <li key={key}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-muted hover:text-cyan text-sm capitalize transition-colors"
                    >
                      {Icon && <Icon size={14} />}
                      {key}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="mt-12 pt-8 border-t border-card-border flex flex-col sm:flex-row justify-between gap-4">
          <p className="font-mono-label text-[10px] text-muted">
            © {new Date().getFullYear()} TRAIC — Robotics &amp; Innovation Club
          </p>
          <p className="font-mono-label text-[10px] text-muted">
            LAT {siteConfig.location.lat} // LON {siteConfig.location.lon}
          </p>
        </div>
      </div>
    </footer>
  );
}
