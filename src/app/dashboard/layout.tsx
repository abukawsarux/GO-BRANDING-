import { getOrCreateDefaultWorkspace } from "@/core/auth/context";
import { DashboardHeader } from "@/components/layout/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { workspace, brand, credits } = await getOrCreateDefaultWorkspace();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <DashboardHeader
        workspaceName={workspace.name}
        brandName={brand?.name || "My Brand"}
        credits={credits}
      />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        {children}
      </main>
    </div>
  );
}
