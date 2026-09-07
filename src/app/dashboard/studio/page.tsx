import { getOrCreateDefaultWorkspace } from "@/core/auth/context";
import { StudioGenerator } from "@/components/studio/studio-generator";
import { BrandKitData } from "@/types/template";

export default async function StudioPage() {
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
  );
}
