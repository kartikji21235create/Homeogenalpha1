import { Suspense } from "react";
import { ConsultationScreen } from "@/features/consultation/ConsultationScreen";

export default function ConsultationPage() {
  return (
    <div className="min-h-[calc(100vh-73px)] py-6">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-24 text-text-secondary text-sm">
            Loading consultation environment...
          </div>
        }
      >
        <ConsultationScreen />
      </Suspense>
    </div>
  );
}
