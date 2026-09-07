import prisma from "@/lib/prisma";

const FALLBACK_WORKSPACE = {
  id: "demo-workspace-id",
  name: "Acme Creative Studio",
  slug: "acme-studio",
  creditBalance: { credits: 50 },
  brands: [
    {
      id: "demo-brand-id",
      name: "Lumina Lifestyle",
      slug: "lumina-lifestyle",
      isDefault: true,
      brandKit: {
        id: "demo-kit-id",
        brandId: "demo-brand-id",
        primaryColor: "#0F172A",
        secondaryColor: "#3B82F6",
        accentColor: "#F59E0B",
        backgroundColor: "#FFFFFF",
        textColor: "#0F172A",
        headingFont: "Inter",
        bodyFont: "Inter",
        primaryLogoUrl: null,
        darkLogoUrl: null,
        whiteLogoUrl: null,
        iconLogoUrl: null,
        website: "https://luminacraft.co",
        phone: "+1 (555) 019-2834",
        email: "hello@luminacraft.co",
        defaultCta: "Shop New Drop",
        instagramHandle: "@luminacraft",
        facebookHandle: "luminacraft",
        tiktokHandle: "@luminacraft",
        twitterHandle: null,
        linkedinHandle: null,
        watermarkEnabled: true,
        watermarkUrl: null,
        watermarkPosition: "BOTTOM_RIGHT" as const,
        watermarkOpacity: 0.85,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    },
  ],
};

export async function getOrCreateDefaultWorkspace() {
  try {
    let workspace = await prisma.workspace.findFirst({
      include: {
        brands: {
          include: {
            brandKit: true,
          },
        },
        creditBalance: true,
      },
    });

    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: {
          name: "Acme Creative Studio",
          slug: "acme-studio",
          creditBalance: {
            create: {
              credits: 50,
            },
          },
          brands: {
            create: {
              name: "Lumina Lifestyle",
              slug: "lumina-lifestyle",
              isDefault: true,
              brandKit: {
                create: {
                  primaryColor: "#0F172A",
                  secondaryColor: "#3B82F6",
                  accentColor: "#F59E0B",
                  backgroundColor: "#FFFFFF",
                  textColor: "#0F172A",
                  headingFont: "Inter",
                  bodyFont: "Inter",
                  website: "https://luminacraft.co",
                  instagramHandle: "@luminacraft",
                  phone: "+1 (555) 019-2834",
                  defaultCta: "Shop New Drop",
                  watermarkEnabled: true,
                  watermarkPosition: "BOTTOM_RIGHT",
                  watermarkOpacity: 0.85,
                },
              },
            },
          },
        },
        include: {
          brands: {
            include: {
              brandKit: true,
            },
          },
          creditBalance: true,
        },
      });

      await prisma.creditLedger.create({
        data: {
          workspaceId: workspace.id,
          amount: 50,
          balanceAfter: 50,
          type: "SIGNUP_BONUS",
          description: "Welcome credits grant",
        },
      });
    }

    const defaultBrand =
      workspace.brands.find((b) => b.isDefault) || workspace.brands[0];

    return {
      workspace,
      brand: defaultBrand,
      brandKit: defaultBrand?.brandKit,
      credits: workspace.creditBalance?.credits ?? 50,
    };
  } catch (err) {
    // If DB is offline (e.g. static build prerender without live Postgres), return fallback workspace
    const defaultBrand = FALLBACK_WORKSPACE.brands[0];
    return {
      workspace: FALLBACK_WORKSPACE as any,
      brand: defaultBrand as any,
      brandKit: defaultBrand.brandKit as any,
      credits: FALLBACK_WORKSPACE.creditBalance.credits,
    };
  }
}

