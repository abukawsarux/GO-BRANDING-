import { getOrCreateDefaultWorkspace } from "@/core/auth/context";
import { DashboardHeader } from "@/components/layout/header";
import { StudioGenerator } from "@/components/studio/studio-generator";
import { BrandKitData } from "@/types/template";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { workspace, brand, brandKit, credits } =
    await getOrCreateDefaultWorkspace();

  const formattedKit: BrandKitData = {
    primaryColor: brandKit?.primaryColor || "#0F172A",
    secondaryColor: brandKit?.secondaryColor || "#3B82F6",
    accentColor: brandKit?.accentColor || "#F59E0B",
    backgroundColor: brandKit?.backgroundColor || "#FFFFFF",
    textColor: brandKit?.textColor || "#0F172A",
    headingFont: brandKit?.headingFont || "Inter",
    bodyFont: brandKit?.bodyFont || "Inter",
    primaryLogoUrl: brandKit?.primaryLogoUrl,
    website: brandKit?.website,
    phone: brandKit?.phone,
    email: brandKit?.email,
    defaultCta: brandKit?.defaultCta || "Shop Now",
    instagramHandle: brandKit?.instagramHandle,
    facebookHandle: brandKit?.facebookHandle,
    tiktokHandle: brandKit?.tiktokHandle,
    watermarkEnabled: brandKit?.watermarkEnabled ?? true,
    watermarkPosition: brandKit?.watermarkPosition,
    watermarkOpacity: brandKit?.watermarkOpacity ?? 0.85,
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <DashboardHeader
        workspaceName={workspace.name}
        brandName={brand?.name || "My Brand"}
        credits={credits}
      />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        <StudioGenerator
          workspaceId={workspace.id}
          brand={{
            id: brand.id,
            name: brand.name,
            slug: brand.slug,
          }}
          brandKit={formattedKit}
          initialCredits={credits}
        />
      </main>
    </div>
  );
}
