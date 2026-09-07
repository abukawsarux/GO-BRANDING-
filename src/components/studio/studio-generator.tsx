"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BUILTIN_TEMPLATES } from "@/core/templates/catalog";
import {
  TemplateDefinition,
  AspectRatioKey,
  ASPECT_RATIOS,
  BrandKitData,
  GenerationOverrides,
} from "@/types/template";
import { CanvasPreview } from "./canvas-preview";
import { generateSocialFormatsAction } from "@/server-actions/generation-actions";
import {
  Upload,
  Sparkles,
  Download,
  Archive,
  Palette,
  CheckCircle2,
  RefreshCw,
  LayoutGrid,
  Square,
  Smartphone,
  Maximize2,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface StudioGeneratorProps {
  workspaceId: string;
  brand: {
    id: string;
    name: string;
    slug: string;
  };
  brandKit: BrandKitData;
  initialCredits: number;
}

// Crisp base64 sample textures so the user sees live branded outputs immediately
const SAMPLE_PRESETS = [
  {
    id: "apparel",
    label: "Fashion / Apparel",
    icon: "👕",
    dataUrl: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1e293b"/>
            <stop offset="100%" stop-color="#0f172a"/>
          </linearGradient>
        </defs>
        <rect width="1200" height="1200" fill="url(#bg)"/>
        <circle cx="600" cy="520" r="320" fill="#3b82f6" opacity="0.25"/>
        <circle cx="600" cy="520" r="240" fill="#3b82f6" opacity="0.4"/>
        <path d="M480 400 L720 400 L840 520 L760 580 L700 520 L700 800 L500 800 L500 520 L440 580 L360 520 Z" fill="#ffffff" opacity="0.9"/>
        <text x="600" y="920" font-family="sans-serif" font-size="44" font-weight="bold" fill="#94a3b8" text-anchor="middle">Premium Cotton Crewneck</text>
      </svg>
    `)}`,
  },
  {
    id: "food",
    label: "Artisan Coffee / Food",
    icon: "☕",
    dataUrl: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
        <defs>
          <linearGradient id="food-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#2d1b14"/>
            <stop offset="100%" stop-color="#180e0a"/>
          </linearGradient>
        </defs>
        <rect width="1200" height="1200" fill="url(#food-bg)"/>
        <circle cx="600" cy="540" r="340" fill="#78350f" opacity="0.3"/>
        <circle cx="600" cy="540" r="260" fill="#d97706" opacity="0.4"/>
        <circle cx="600" cy="540" r="180" fill="#fef3c7" opacity="0.9"/>
        <circle cx="600" cy="540" r="140" fill="#78350f" opacity="0.85"/>
        <text x="600" y="940" font-family="sans-serif" font-size="44" font-weight="bold" fill="#fef3c7" text-anchor="middle">Single Origin Roasted Espresso</text>
      </svg>
    `)}`,
  },
  {
    id: "tech",
    label: "Minimal Tech",
    icon: "📱",
    dataUrl: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
        <defs>
          <linearGradient id="tech-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#09090b"/>
            <stop offset="100%" stop-color="#18181b"/>
          </linearGradient>
        </defs>
        <rect width="1200" height="1200" fill="url(#tech-bg)"/>
        <rect x="420" y="320" width="360" height="560" rx="48" fill="#27272a" stroke="#3f3f46" stroke-width="8"/>
        <rect x="450" y="360" width="300" height="480" rx="32" fill="#10b981" opacity="0.3"/>
        <circle cx="600" cy="600" r="70" fill="#10b981"/>
        <text x="600" y="980" font-family="sans-serif" font-size="44" font-weight="bold" fill="#a1a1aa" text-anchor="middle">Smart Device Ultra</text>
      </svg>
    `)}`,
  },
];

export function StudioGenerator({
  workspaceId,
  brand,
  brandKit,
  initialCredits,
}: StudioGeneratorProps) {
  // Pre-load first sample so the user instantly sees the branded experience!
  const [userImageBase64, setUserImageBase64] = useState<string>(
    SAMPLE_PRESETS[0].dataUrl,
  );
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDefinition>(
    BUILTIN_TEMPLATES[0],
  );
  const [viewMode, setViewMode] = useState<"grid" | "focused">("grid");
  const [focusedRatio, setFocusedRatio] =
    useState<AspectRatioKey>("SQUARE_1_1");

  // Simple copy controls
  const [headline, setHeadline] = useState("Discover Summer Essentials 2026");
  const [ctaText, setCtaText] = useState(
    brandKit.defaultCta || "Shop Collection",
  );

  // Action status
  const [isGenerating, setIsGenerating] = useState(false);
  const [completedGeneration, setCompletedGeneration] = useState<any | null>(
    null,
  );
  const [credits, setCredits] = useState(initialCredits);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setUserImageBase64(reader.result as string);
      setCompletedGeneration(null);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  }

  const overrides: GenerationOverrides = {
    headline,
    ctaText,
  };

  async function handleBatchGenerateAndDownload() {
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const res = await generateSocialFormatsAction({
        workspaceId,
        brandId: brand.id,
        templateId: selectedTemplate.id,
        imageBase64: userImageBase64,
        title: headline,
        overrides,
      });

      if (res.success && res.data) {
        setCompletedGeneration(res.data);
        setCredits((c) => Math.max(0, c - 1));

        // Trigger download of the ZIP bundle automatically!
        const zipUrl = `/api/exports/${res.data.id}/zip`;
        const link = document.createElement("a");
        link.href = zipUrl;
        link.download = `${brand.name.toLowerCase()}-branded-assets.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        setErrorMessage(res.error || "Generation failed. Please try again.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsGenerating(false);
    }
  }

  const ratios: AspectRatioKey[] = [
    "SQUARE_1_1",
    "STORY_9_16",
    "PORTRAIT_4_5",
    "LANDSCAPE_16_9",
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Core Brand Kit Status Ribbon */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">
                {brand.name}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                <CheckCircle2 className="h-3 w-3" /> Brand Kit Active
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
              <span>Auto-applies palette:</span>
              <span
                className="h-3 w-3 rounded-full border border-slate-300"
                style={{ backgroundColor: brandKit.primaryColor }}
                title="Primary"
              />
              <span
                className="h-3 w-3 rounded-full border border-slate-300"
                style={{ backgroundColor: brandKit.secondaryColor }}
                title="Secondary"
              />
              <span
                className="h-3 w-3 rounded-full border border-slate-300"
                style={{ backgroundColor: brandKit.accentColor }}
                title="Accent"
              />
              <span className="text-slate-300">•</span>
              <span>{brandKit.headingFont} Font</span>
              {brandKit.watermarkEnabled && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1 text-slate-600">
                    <ShieldCheck className="h-3 w-3 text-blue-600" /> Watermark
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <Link
          href="/dashboard/brand"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors shrink-0"
        >
          <Palette className="h-3.5 w-3.5 text-blue-600" /> Edit Brand Kit
        </Link>
      </div>

      {/* 2. Hero USP & Upload Bar */}
      <div className="text-center max-w-3xl mx-auto pt-2 pb-4 space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          “Set your brand once. Brand every content automatically.”
        </h1>
        <p className="text-sm text-slate-500">
          Upload any photo and instantly generate all social media formats
          branded with your exact colors, fonts, handles, and watermark.
        </p>
      </div>

      {/* 3. Streamlined Control Bar: Upload, Template, and Copy Inputs */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* A. Upload / Sample button (4 cols) */}
          <div className="md:col-span-4 flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              1. Your Content Image
            </label>
            <div className="flex items-center gap-2">
              <label className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-50 px-4 py-2.5 text-xs font-semibold text-blue-700 cursor-pointer transition-colors">
                <Upload className="h-4 w-4 text-blue-600" />
                <span>Upload New Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400">Samples:</span>
              {SAMPLE_PRESETS.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => setUserImageBase64(sample.dataUrl)}
                  className={`rounded-lg px-2 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                    userImageBase64 === sample.dataUrl
                      ? "bg-blue-600 text-white font-semibold shadow-2xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {sample.icon} {sample.label.split("/")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* B. Template Switcher (4 cols) */}
          <div className="md:col-span-4 flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              2. Template Style
            </label>
            <div className="flex rounded-xl bg-slate-100 p-1">
              {BUILTIN_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all cursor-pointer truncate px-2 ${
                    selectedTemplate.id === tpl.id
                      ? "bg-white text-slate-900 font-bold shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title={tpl.name}
                >
                  {tpl.name.split(" ")[0]} {tpl.name.split(" ")[1]}
                </button>
              ))}
            </div>
          </div>

          {/* C. Primary Action: 1-Click Generate & Download ZIP (4 cols) */}
          <div className="md:col-span-4 flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              3. Automatic Export
            </label>
            <button
              onClick={handleBatchGenerateAndDownload}
              disabled={isGenerating}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-violet-700 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Rendering All 4
                  Formats...
                </>
              ) : (
                <>
                  <Archive className="h-4 w-4" /> Download All Formats (ZIP)
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Inline Headline & CTA Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
              Post Headline
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Post Headline"
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
              Button CTA Text
            </label>
            <input
              type="text"
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              placeholder="e.g. Shop Now"
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
          {errorMessage}
        </div>
      )}

      {/* 4. Format View Controls & Live Branded Social Assets */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Live Branded Outputs
            </span>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
              4 Formats
            </span>
          </div>

          <div className="flex items-center gap-1 rounded-xl bg-slate-200/70 p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                viewMode === "grid"
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Grid View</span>
            </button>
            <button
              onClick={() => setViewMode("focused")}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                viewMode === "focused"
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span>Single Focus</span>
            </button>
          </div>
        </div>

        {/* VIEW 1: ALL 4 FORMATS GRID VIEW */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
            {ratios.map((ratioKey) => {
              const meta = ASPECT_RATIOS[ratioKey];
              const layout = selectedTemplate.layouts[ratioKey];

              // Target preview box width
              const previewBoxWidth = 260;
              const zoom = previewBoxWidth / layout.width;

              return (
                <div
                  key={ratioKey}
                  className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900">
                          {meta.badge} {meta.label}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {meta.sublabel}
                        </span>
                      </div>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-500">
                        {layout.width}x{layout.height}
                      </span>
                    </div>

                    {/* Canvas Preview Container */}
                    <div className="rounded-xl bg-slate-100/60 p-2 flex items-center justify-center overflow-hidden min-h-[300px]">
                      <CanvasPreview
                        layout={layout}
                        brandKit={brandKit}
                        userImageBase64={userImageBase64}
                        overrides={overrides}
                        brandName={brand.name}
                        zoomLevel={zoom}
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleBatchGenerateAndDownload}
                    disabled={isGenerating}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5 text-slate-500" /> Download{" "}
                    {meta.badge} PNG
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          /* VIEW 2: FOCUSED SINGLE VIEW */
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                {ratios.map((ratioKey) => {
                  const meta = ASPECT_RATIOS[ratioKey];
                  const isSelected = focusedRatio === ratioKey;
                  return (
                    <button
                      key={ratioKey}
                      onClick={() => setFocusedRatio(ratioKey)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-slate-900 text-white font-bold"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {meta.badge} {meta.label}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleBatchGenerateAndDownload}
                disabled={isGenerating}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                <Download className="h-3.5 w-3.5" /> Download HD PNG
              </button>
            </div>

            <div className="flex items-center justify-center min-h-[500px] bg-slate-100/50 rounded-xl p-4 overflow-hidden">
              <CanvasPreview
                layout={selectedTemplate.layouts[focusedRatio]}
                brandKit={brandKit}
                userImageBase64={userImageBase64}
                overrides={overrides}
                brandName={brand.name}
                zoomLevel={Math.min(
                  1,
                  460 / selectedTemplate.layouts[focusedRatio].width,
                )}
              />
            </div>
          </div>
        )}
      </div>

      {/* 5. Completed Export Alert if ready */}
      {completedGeneration && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                All 4 Formats Successfully Generated!
              </h4>
              <p className="text-xs text-slate-600">
                Your ZIP bundle download has started. You can also re-download
                any format from History.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`/api/exports/${completedGeneration.id}/zip`}
              download
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
            >
              <Archive className="h-3.5 w-3.5" /> Re-download ZIP
            </a>
            <Link
              href="/dashboard/history"
              className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-white px-3.5 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 transition-colors"
            >
              View History <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
