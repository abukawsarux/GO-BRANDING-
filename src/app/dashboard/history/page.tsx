import { getOrCreateDefaultWorkspace } from "@/core/auth/context";
import { GenerationHistory } from "@/components/history/generation-history";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const { workspace } = await getOrCreateDefaultWorkspace();

  let generations: any[] = [];
  try {
    generations = await prisma.generation.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "desc" },
      include: {
        exports: true,
        brand: true,
      },
      take: 40,
    });
  } catch {
    generations = [];
  }

  return <GenerationHistory generations={generations} />;
}
