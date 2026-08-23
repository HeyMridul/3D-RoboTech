import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center section-padding">
      <div className="text-center">
        <p className="font-mono-label text-cyan mb-4">ERROR 404</p>
        <h1 className="font-display text-6xl font-bold mb-4">SIGNAL LOST</h1>
        <p className="text-muted mb-8 max-w-md mx-auto">
          The requested resource could not be located in the TRAIC system database.
        </p>
        <Link href="/">
          <Button>RETURN TO BASE</Button>
        </Link>
      </div>
    </div>
  );
}
