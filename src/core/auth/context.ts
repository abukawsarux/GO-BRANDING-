import prisma from "@/lib/prisma";

export async function getOrCreateDefaultWorkspace() {
  // Check if a demo or default workspace exists
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
    // Create initial default workspace for rapid development and testing
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

    // Record initial signup credits in ledger
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
}

