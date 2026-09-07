import { getOrCreateDefaultWorkspace } from "@/core/auth/context";
import { GenerationHistory } from "@/components/history/generation-history";
import prisma from "@/lib/prisma";

export default async function HistoryPage() {
  const { workspace } = await getOrCreateDefaultWorkspace();

  const generations = await prisma.generation.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
    include: {
      exports: true,
      brand: true,
    },
    take: 40,
  });

  return <GenerationHistory generations={generations} />;
}
