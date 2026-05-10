import { getPavilions, getPavilionById } from "@/lib/data";
import { GridContainer } from "@/components/grid-container";

interface PageProps {
  searchParams: Promise<{ pavilion?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const pavilions = getPavilions();
  const initialSelectedId = params.pavilion || null;
  const initialPavilion = initialSelectedId
    ? getPavilionById(initialSelectedId) || null
    : null;

  return (
    <main className="h-screen w-screen flex flex-col overflow-hidden">
      <GridContainer
        pavilions={pavilions}
        initialSelectedId={initialSelectedId}
        initialPavilion={initialPavilion}
      />
    </main>
  );
}
