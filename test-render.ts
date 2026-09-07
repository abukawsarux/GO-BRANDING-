import sharp from "sharp";
import fs from "fs";
import path from "path";
import { BUILTIN_TEMPLATES } from "./src/core/templates/catalog";
import { renderCanvasWithSharp } from "./src/core/rendering/sharp-renderer";
import { BrandKitData, AspectRatioKey } from "./src/types/template";

async function runBenchmark() {
  console.log("🚀 Starting BrandFlow Sharp Rendering Engine Benchmark...");

  const outputDir = path.join(__dirname, "test-output");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 1. Generate a mock high-resolution photo buffer (1600x1200)
  console.log("📷 Generating mock photographic texture...");
  const mockImageBuffer = await sharp({
    create: {
      width: 1600,
      height: 1200,
      channels: 4,
      background: { r: 52, g: 73, b: 94, alpha: 1 },
    },
  })
    .composite([
      {
        input: Buffer.from(`
          <svg width="1600" height="1200">
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#10b981;stop-opacity:1" />
              </linearGradient>
            </defs>
            <rect width="1600" height="1200" fill="url(#grad1)" />
            <circle cx="800" cy="600" r="300" fill="rgba(255,255,255,0.15)" />
            <text x="800" y="620" font-size="60" font-family="sans-serif" font-weight="bold" fill="#ffffff" text-anchor="middle">Sample Subject</text>
          </svg>
        `),
        top: 0,
        left: 0,
      },
    ])
    .png()
    .toBuffer();

  // 2. Mock Brand Kit
  const mockBrandKit: BrandKitData = {
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
  };

  // 3. Mock Watermark Buffer
  const mockWatermark = await sharp({
    create: {
      width: 200,
      height: 60,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: Buffer.from(`
          <svg width="200" height="60">
            <rect width="200" height="60" rx="10" fill="rgba(15,23,42,0.6)" />
            <text x="100" y="38" font-size="20" font-family="sans-serif" font-weight="bold" fill="#ffffff" text-anchor="middle">⚡ LUMINA</text>
          </svg>
        `),
        top: 0,
        left: 0,
      },
    ])
    .png()
    .toBuffer();

  const template = BUILTIN_TEMPLATES[0]; // Minimalist Product Showcase
  const aspectRatios: AspectRatioKey[] = [
    "SQUARE_1_1",
    "STORY_9_16",
    "PORTRAIT_4_5",
    "LANDSCAPE_16_9",
  ];

  console.log(`🎨 Using Template: ${template.name}`);

  for (const ratio of aspectRatios) {
    const layout = template.layouts[ratio];
    console.log(`\n⏳ Rendering ${ratio} (${layout.width}x${layout.height})...`);

    const result = await renderCanvasWithSharp({
      layout,
      userImageBuffer: mockImageBuffer,
      brandKit: mockBrandKit,
      watermarkBuffer: mockWatermark,
      overrides: {
        headline: "SUMMER ESSENTIALS 2026",
        ctaText: "Explore Now",
      },
      outputFormat: "png",
    });

    const filename = `render-${ratio.toLowerCase()}.png`;
    const outputPath = path.join(outputDir, filename);
    fs.writeFileSync(outputPath, result.buffer);

    console.log(`✅ ${ratio} Rendered in ${result.renderDurationMs}ms!`);
    console.log(`   File size: ${(result.buffer.length / 1024).toFixed(1)} KB`);
    console.log(`   Saved: ${outputPath}`);
  }

  console.log("\n🎉 All 4 social media formats successfully generated!");
}

runBenchmark().catch(console.error);

