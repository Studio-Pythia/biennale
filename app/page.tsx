import { getPavilions } from "@/lib/data";
import { CardGrid } from "@/components/cards/card-grid";

export default async function Page() {
  const pavilions = getPavilions();

  return <CardGrid pavilions={pavilions} />;
}
