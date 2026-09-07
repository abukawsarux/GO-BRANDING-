import { getOrCreateDefaultWorkspace } from "@/core/auth/context";
import { BrandKitEditor } from "@/components/branding/brand-kit-editor";

export default async function BrandPage() {
  const { brand } = await getOrCreateDefaultWorkspace();

  return <BrandKitEditor brand={brand} />;
}
