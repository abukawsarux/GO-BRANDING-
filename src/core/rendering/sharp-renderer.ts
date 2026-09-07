import sharp, { OverlayOptions } from "sharp";
import {
  CanvasLayout,
  BrandKitData,
  GenerationOverrides,
  ImageSlotElement,
  BrandLogoElement,
} from "@/types/template";
import { buildSvgOverlay } from "./svg-builder";

export interface RenderResult {
  buffer: Buffer;
  mimeType: string;
  width: number;
  height: number;
  renderDurationMs: number;
}

export async function renderCanvasWithSharp(params: {
  layout: CanvasLayout;
  userImageBuffer: Buffer;
  brandKit: BrandKitData;
  overrides?: GenerationOverrides;
  logoBuffer?: Buffer | null;
  watermarkBuffer?: Buffer | null;
  outputFormat?: "png" | "jpeg" | "webp";
}): Promise<RenderResult> {
  const startTime = Date.now();
  const {
    layout,
    userImageBuffer,
    brandKit,
    overrides,
    logoBuffer,
    watermarkBuffer,
    outputFormat = "png",
  } = params;

  const compositeLayers: OverlayOptions[] = [];

  // 1. Process User Image Slot
  const imageSlot = layout.elements.find(
    (el) => el.type === "IMAGE_SLOT"
  ) as ImageSlotElement | undefined;

  if (imageSlot && userImageBuffer && userImageBuffer.length > 0) {
    let processedImage = sharp(userImageBuffer).resize(
      Math.round(imageSlot.width),
      Math.round(imageSlot.height),
      {
        fit: imageSlot.fit || "cover",
        position: "centre",
      }
    );

    // Apply border radius mask if specified
    if (imageSlot.borderRadius && imageSlot.borderRadius > 0) {
      const maskSvg = `
        <svg width="${imageSlot.width}" height="${imageSlot.height}">
          <rect x="0" y="0" width="${imageSlot.width}" height="${imageSlot.height}" rx="${imageSlot.borderRadius}" fill="#fff" />
        </svg>
      `;
      const maskBuffer = Buffer.from(maskSvg);
      processedImage = processedImage.composite([
        {
          input: maskBuffer,
          blend: "dest-in",
        },
      ]);
    }

    const imageSlotBuffer = await processedImage.png().toBuffer();
    compositeLayers.push({
      input: imageSlotBuffer,
      top: Math.round(imageSlot.y),
      left: Math.round(imageSlot.x),
    });
  }

  // 2. Process Brand Logo Slot (if present and logo buffer available)
  const logoSlot = layout.elements.find(
    (el) => el.type === "BRAND_LOGO"
  ) as BrandLogoElement | undefined;

  if (logoSlot && logoBuffer && logoBuffer.length > 0) {
    try {
      const resizedLogo = await sharp(logoBuffer)
        .resize(Math.round(logoSlot.width), Math.round(logoSlot.height), {
          fit: "inside",
          withoutEnlargement: true,
        })
        .png()
        .toBuffer();

      compositeLayers.push({
        input: resizedLogo,
        top: Math.round(logoSlot.y),
        left: Math.round(logoSlot.x),
      });
    } catch (e) {
      console.warn("Could not process brand logo in renderCanvasWithSharp:", e);
    }
  }

  // 3. Process Vector SVG Overlay (Text, Badges, CTAs, Social Handles, Shapes)
  const svgMarkup = buildSvgOverlay(layout, brandKit, overrides);
  const svgOverlayBuffer = Buffer.from(svgMarkup);
  compositeLayers.push({
    input: svgOverlayBuffer,
    top: 0,
    left: 0,
  });

  // 4. Process Watermark (if enabled)
  if (brandKit.watermarkEnabled && watermarkBuffer && watermarkBuffer.length > 0) {
    try {
      const watermarkWidth = Math.round(layout.width * 0.15); // 15% width
      const opacity = brandKit.watermarkOpacity ?? 0.8;

      const processedWatermark = await sharp(watermarkBuffer)
        .resize({ width: watermarkWidth, fit: "inside" })
        .composite([
          {
            input: Buffer.from([255, 255, 255, Math.round(opacity * 255)]),
            raw: { width: 1, height: 1, channels: 4 },
            tile: true,
            blend: "dest-in",
          },
        ])
        .png()
        .toBuffer();

      const meta = await sharp(processedWatermark).metadata();
      const wmWidth = meta.width || watermarkWidth;
      const wmHeight = meta.height || 50;

      let wmTop = 40;
      let wmLeft = 40;
      const pos = brandKit.watermarkPosition || "BOTTOM_RIGHT";

      switch (pos) {
        case "TOP_LEFT":
          wmTop = 40;
          wmLeft = 40;
          break;
        case "TOP_RIGHT":
          wmTop = 40;
          wmLeft = layout.width - wmWidth - 40;
          break;
        case "BOTTOM_LEFT":
          wmTop = layout.height - wmHeight - 40;
          wmLeft = 40;
          break;
        case "BOTTOM_RIGHT":
          wmTop = layout.height - wmHeight - 40;
          wmLeft = layout.width - wmWidth - 40;
          break;
        case "CENTER":
          wmTop = Math.round((layout.height - wmHeight) / 2);
          wmLeft = Math.round((layout.width - wmWidth) / 2);
          break;
      }

      compositeLayers.push({
        input: processedWatermark,
        top: Math.max(0, wmTop),
        left: Math.max(0, wmLeft),
      });
    } catch (e) {
      console.warn("Watermark processing failed:", e);
    }
  }

  // 5. Build Background Canvas
  const bgColor = layout.backgroundColor.startsWith("#")
    ? layout.backgroundColor
    : "#FFFFFF";

  let finalPipeline = sharp({
    create: {
      width: layout.width,
      height: layout.height,
      channels: 4,
      background: bgColor,
    },
  }).composite(compositeLayers);

  let outputBuffer: Buffer;
  let mimeType = "image/png";

  if (outputFormat === "webp") {
    outputBuffer = await finalPipeline.webp({ quality: 90 }).toBuffer();
    mimeType = "image/webp";
  } else if (outputFormat === "jpeg") {
    outputBuffer = await finalPipeline.jpeg({ quality: 90 }).toBuffer();
    mimeType = "image/jpeg";
  } else {
    outputBuffer = await finalPipeline.png({ compressionLevel: 8 }).toBuffer();
    mimeType = "image/png";
  }

  const renderDurationMs = Date.now() - startTime;

  return {
    buffer: outputBuffer,
    mimeType,
    width: layout.width,
    height: layout.height,
    renderDurationMs,
  };
}

