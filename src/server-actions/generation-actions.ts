"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getTemplateById } from "@/core/templates/catalog";
import { renderCanvasWithSharp } from "@/core/rendering/sharp-renderer";
import { saveRenderedAsset } from "@/core/storage/s3-client";
import { deductCredits, addCredits } from "@/core/credits/credit-service";
import { AspectRatioKey, GenerationOverrides } from "@/types/template";
import { AspectRatio } from "@prisma/client";
import sharp from "sharp";

export interface GenerateSocialFormatsInput {
  workspaceId: string;
  brandId: string;
  templateId: string;
  imageBase64: string; // Base64 data URL
  title: string;
  overrides?: GenerationOverrides;
}

export async function generateSocialFormatsAction(input: GenerateSocialFormatsInput) {
  let creditDeducted = false;
  let generationId: string | null = null;

  try {
    // 1. Deduct 1 generation credit
    await deductCredits({
      workspaceId: input.workspaceId,
      amount: 1,
      type: "IMAGE_RENDER",
      description: `Render post: ${input.title || "Untitled"}`,
    });
    creditDeducted = true;

    // 2. Fetch Brand & BrandKit
    const brand = await prisma.brand.findUnique({
      where: { id: input.brandId },
      include: { brandKit: true },
    });

    if (!brand || !brand.brandKit) {
      throw new Error("Brand or Brand Kit not found");
    }

    const brandKit = brand.brandKit;

    // 3. Resolve Template Definition
    const templateDef = getTemplateById(input.templateId);
    if (!templateDef) {
      throw new Error(`Template not found: ${input.templateId}`);
    }

    // Ensure template exists in database for foreign key relation
    await prisma.template.upsert({
      where: { id: templateDef.id },
      update: {
        name: templateDef.name,
        category: templateDef.category,
        description: templateDef.description,
        thumbnailUrl: templateDef.thumbnailUrl,
        schemaJson: JSON.stringify(templateDef.layouts),
      },
      create: {
        id: templateDef.id,
        name: templateDef.name,
        category: templateDef.category,
        description: templateDef.description,
        thumbnailUrl: templateDef.thumbnailUrl,
        isSystem: true,
        schemaJson: JSON.stringify(templateDef.layouts),
        supportedRatios: [
          AspectRatio.SQUARE_1_1,
          AspectRatio.STORY_9_16,
          AspectRatio.PORTRAIT_4_5,
          AspectRatio.LANDSCAPE_16_9,
        ],
      },
    });

    // 4. Create Generation record
    const generation = await prisma.generation.create({
      data: {
        workspaceId: input.workspaceId,
        brandId: input.brandId,
        templateId: templateDef.id,
        title: input.title || templateDef.name,
        status: "PROCESSING",
        customOverrides: JSON.stringify(input.overrides || {}),
      },
    });
    generationId = generation.id;

    // 5. Decode user image buffer
    const base64Data = input.imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const userImageBuffer = Buffer.from(base64Data, "base64");

    // 6. Optional: watermark buffer if enabled
    let watermarkBuffer: Buffer | null = null;
    if (brandKit.watermarkEnabled) {
      const watermarkText = brand.name.toUpperCase();
      watermarkBuffer = await sharp({
        create: {
          width: 240,
          height: 60,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
      })
        .composite([
          {
            input: Buffer.from(`
              <svg width="240" height="60">
                <rect width="240" height="60" rx="12" fill="rgba(15,23,42,0.65)" />
                <text x="120" y="37" font-size="18" font-family="sans-serif" font-weight="bold" fill="#ffffff" text-anchor="middle">⚡ ${watermarkText}</text>
              </svg>
            `),
            top: 0,
            left: 0,
          },
        ])
        .png()
        .toBuffer();
    }

    // 7. Render all 4 aspect ratios
    const ratios: AspectRatioKey[] = [
      "SQUARE_1_1",
      "STORY_9_16",
      "PORTRAIT_4_5",
      "LANDSCAPE_16_9",
    ];

    const exportsCreated = [];

    for (const ratio of ratios) {
      const layout = templateDef.layouts[ratio];

      const renderResult = await renderCanvasWithSharp({
        layout,
        userImageBuffer,
        brandKit: {
          primaryColor: brandKit.primaryColor,
          secondaryColor: brandKit.secondaryColor,
          accentColor: brandKit.accentColor,
          backgroundColor: brandKit.backgroundColor,
          textColor: brandKit.textColor,
          headingFont: brandKit.headingFont,
          bodyFont: brandKit.bodyFont,
          website: brandKit.website,
          phone: brandKit.phone,
          email: brandKit.email,
          defaultCta: brandKit.defaultCta,
          instagramHandle: brandKit.instagramHandle,
          facebookHandle: brandKit.facebookHandle,
          tiktokHandle: brandKit.tiktokHandle,
          watermarkEnabled: brandKit.watermarkEnabled,
          watermarkPosition: brandKit.watermarkPosition,
          watermarkOpacity: brandKit.watermarkOpacity,
        },
        overrides: input.overrides,
        watermarkBuffer,
        outputFormat: "png",
      });

      // Save rendered artifact
      const fileKey = `workspaces/${input.workspaceId}/generations/${generation.id}/${ratio.toLowerCase()}.png`;
      const publicUrl = await saveRenderedAsset({
        fileKey,
        buffer: renderResult.buffer,
        mimeType: renderResult.mimeType,
      });

      // Save Export Record in DB
      const exportRecord = await prisma.generatedExport.create({
        data: {
          generationId: generation.id,
          aspectRatio: ratio as AspectRatio,
          fileKey,
          url: publicUrl,
          width: renderResult.width,
          height: renderResult.height,
          fileSizeBytes: renderResult.buffer.length,
          format: "png",
          renderTimeMs: renderResult.renderDurationMs,
        },
      });

      exportsCreated.push(exportRecord);
    }

    // 8. Update generation status to COMPLETED
    const completedGen = await prisma.generation.update({
      where: { id: generation.id },
      data: { status: "COMPLETED" },
      include: {
        exports: true,
        brand: true,
      },
    });

    revalidatePath("/dashboard/history");
    revalidatePath("/dashboard/studio");

    return {
      success: true,
      data: completedGen,
    };
  } catch (error) {
    console.error("Social formats generation error:", error);

    // Refund credit if failed after deduction
    if (creditDeducted) {
      try {
        await addCredits({
          workspaceId: input.workspaceId,
          amount: 1,
          type: "REFUND_FAILED_RENDER",
          description: "Refund for failed generation",
          referenceId: generationId || undefined,
        });
      } catch (refundErr) {
        console.error("Refund error:", refundErr);
      }
    }

    if (generationId) {
      await prisma.generation.update({
        where: { id: generationId },
        data: { status: "FAILED" },
      });
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Generation failed",
    };
  }
}

export async function getGenerationHistoryAction(workspaceId: string) {
  try {
    const items = await prisma.generation.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      include: {
        exports: true,
        brand: true,
      },
      take: 30,
    });

    return { success: true, data: items };
  } catch (error) {
    console.error("Failed to load history:", error);
    return { success: false, error: "Failed to load generation history" };
  }
}

