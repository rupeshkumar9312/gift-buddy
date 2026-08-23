import { Suspense } from "react";
import { Spinner } from "@/components/Spinner";
import { TrackOrdersClient } from "./TrackOrdersClient";

export default function TrackOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="container-page flex min-h-[50vh] items-center justify-center py-20">
          <Spinner size={32} className="text-primary" />
        </div>
      }
    >
      <TrackOrdersClient />
    </Suspense>
  );
}
