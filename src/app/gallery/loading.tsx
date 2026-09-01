import { LoadingState } from "@/components/ui/LoadingState";

// Safe here: this segment has no dynamic child route that calls notFound(),
// so the Suspense boundary cannot turn a missing record into a soft 404.
export default function Loading() {
  return <LoadingState />;
}
