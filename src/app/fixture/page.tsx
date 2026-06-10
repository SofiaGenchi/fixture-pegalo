import { Suspense } from "react";
import { getMatches } from "@/lib/services/matches.service";
import { FixtureTabs } from "@/components/fixture-tabs";
import { Skeleton } from "@/components/ui/skeleton";

export const revalidate = 0; // Dynamic rendering

export const metadata = {
  title: "Fixture y Grupos - PEGALO Mundial 2026",
  description: "Consultá el calendario completo de partidos del Mundial 2026. Fechas, horarios, estadios y tablas de posiciones de los grupos en vivo.",
  openGraph: {
    title: "Fixture y Grupos - PEGALO Mundial 2026",
    description: "Mirá el calendario de partidos y completá tus pronósticos.",
    images: [{ url: "/icon.png" }],
  },
};

export default async function FixturePage() {
  const matches = await getMatches();

  return (
    <Suspense fallback={<FixtureSkeleton />}>
      <FixtureTabs initialMatches={matches} />
    </Suspense>
  );
}

function FixtureSkeleton() {
  return (
    <div className="space-y-4 p-4 animate-pulse">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-12 w-full" />
      <div className="grid grid-cols-6 gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}
