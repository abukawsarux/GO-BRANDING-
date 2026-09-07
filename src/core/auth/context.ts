import prisma from "@/lib/prisma";

const FALLBACK_WORKSPACE = {
  id: "demo-workspace-id",
  name: "Urban Wear",
  slug: "urban-wear",
  planTier: "PRO",
  creditBalance: { credits: 10 },
  brands: [
    {
      id: "demo-brand-id",
      name: "Urban Wear",
      slug: "urban-wear",
      isDefault: true,
      brandKit: {
        id: "demo-kit-id",
        brandId: "demo-brand-id",
        primaryColor: "#000000",
        secondaryColor: "#FF5A36",
        accentColor: "#3B82F6",
        backgroundColor: "#FFFFFF",
        textColor: "#0F172A",
        headingFont: "Montserrat",
        bodyFont: "Inter",
        primaryLogoUrl: null,
        darkLogoUrl: null,
        whiteLogoUrl: null,
        iconLogoUrl: null,
        website: "urbanwear.co",
        phone: "+880 1712 345678",
        email: "hello@urbanwear.co",
        defaultCta: "SHOP NOW",
        instagramHandle: "@urbanwear",
        facebookHandle: "urbanwear",
        tiktokHandle: "@urbanwear",
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
          name: "Urban Wear",
          slug: "urban-wear",
          creditBalance: {
            create: {
              credits: 10,
            },
          },
          brands: {
            create: {
              name: "Urban Wear",
              slug: "urban-wear",
              isDefault: true,
              brandKit: {
                create: {
                  primaryColor: "#000000",
                  secondaryColor: "#FF5A36",
                  accentColor: "#3B82F6",
                  backgroundColor: "#FFFFFF",
                  textColor: "#0F172A",
                  headingFont: "Montserrat",
                  bodyFont: "Inter",
                  website: "urbanwear.co",
                  instagramHandle: "@urbanwear",
                  facebookHandle: "urbanwear",
                  tiktokHandle: "@urbanwear",
                  phone: "+880 1712 345678",
                  defaultCta: "SHOP NOW",
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
          amount: 10,
          balanceAfter: 10,
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
      credits: workspace.creditBalance?.credits ?? 10,
    };
  } catch {
    const defaultBrand = FALLBACK_WORKSPACE.brands[0];
    return {
      workspace: FALLBACK_WORKSPACE as any,
      brand: defaultBrand as any,
      brandKit: defaultBrand.brandKit as any,
      credits: FALLBACK_WORKSPACE.creditBalance.credits,
    };
  }
}
