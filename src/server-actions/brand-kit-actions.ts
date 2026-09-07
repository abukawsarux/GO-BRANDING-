"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { WatermarkPosition } from "@prisma/client";

export interface UpdateBrandKitInput {
  brandId: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  headingFont?: string;
  bodyFont?: string;
  website?: string;
  phone?: string;
  email?: string;
  defaultCta?: string;
  instagramHandle?: string;
  facebookHandle?: string;
  tiktokHandle?: string;
  primaryLogoUrl?: string;
  watermarkEnabled?: boolean;
  watermarkPosition?: WatermarkPosition;
  watermarkOpacity?: number;
}

export async function updateBrandKitAction(input: UpdateBrandKitInput) {
  try {
    const updated = await prisma.brandKit.upsert({
      where: { brandId: input.brandId },
      update: {
        primaryColor: input.primaryColor,
        secondaryColor: input.secondaryColor,
        accentColor: input.accentColor,
        backgroundColor: input.backgroundColor,
        textColor: input.textColor,
        headingFont: input.headingFont,
        bodyFont: input.bodyFont,
        website: input.website,
        phone: input.phone,
        email: input.email,
        defaultCta: input.defaultCta,
        instagramHandle: input.instagramHandle,
        facebookHandle: input.facebookHandle,
        tiktokHandle: input.tiktokHandle,
        primaryLogoUrl: input.primaryLogoUrl,
        watermarkEnabled: input.watermarkEnabled,
        watermarkPosition: input.watermarkPosition,
        watermarkOpacity: input.watermarkOpacity,
      },
      create: {
        brandId: input.brandId,
        primaryColor: input.primaryColor || "#0F172A",
        secondaryColor: input.secondaryColor || "#3B82F6",
        accentColor: input.accentColor || "#10B981",
        backgroundColor: input.backgroundColor || "#FFFFFF",
        textColor: input.textColor || "#1E293B",
        headingFont: input.headingFont || "Inter",
        bodyFont: input.bodyFont || "Inter",
        website: input.website,
        phone: input.phone,
        email: input.email,
        defaultCta: input.defaultCta || "Learn More",
        instagramHandle: input.instagramHandle,
        facebookHandle: input.facebookHandle,
        tiktokHandle: input.tiktokHandle,
        primaryLogoUrl: input.primaryLogoUrl,
        watermarkEnabled: input.watermarkEnabled ?? false,
        watermarkPosition: input.watermarkPosition ?? "BOTTOM_RIGHT",
        watermarkOpacity: input.watermarkOpacity ?? 0.8,
      },
    });

    revalidatePath("/dashboard/brand");
    revalidatePath("/dashboard/studio");

    return { success: true, data: updated };
  } catch (error) {
    console.error("Failed to update brand kit:", error);
    return { success: false, error: "Failed to update brand kit" };
  }
}

