"use client";

import React, { useState } from "react";
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
  CheckCircle2,
  RefreshCw,
  Sliders,
  Layers,
  Check,
  AlertCircle,
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

export function StudioGenerator({
  workspaceId,
  brand,
  brandKit,
  initialCredits,
}: StudioGeneratorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDefinition>(
    BUILTIN_TEMPLATES[0],
  );
  const [selectedRatio, setSelectedRatio] =
    useState<AspectRatioKey>("SQUARE_1_1");
  const [userImageBase64, setUserImageBase64] = useState<string | null>(null);

  // Overrides
  const [headline, setHeadline] = useState("Discover Summer Essentials 2026");
  const [subheadline, setSubheadline] = useState(
    "Handcrafted quality designed for everyday comfort.",
  );
  const [ctaText, setCtaText] = useState("Shop Collection");

  // State
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [completedGeneration, setCompletedGeneration] = useState<any | null>(
    null,
  );
  const [credits, setCredits] = useState(initialCredits);

  // Sample quick images
  const sampleImages = [
    {
      label: "Fashion / Apparel",
      data: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='1200'><rect width='1200' height='1200' fill='%231e293b'/><circle cx='600' cy='500' r='320' fill='%233b82f6'/><rect x='350' y='700' width='500' height='380' rx='60' fill='%2360a5fa'/></svg>",
    },
    {
      label: "Artisan Coffee / Food",
      data: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='1200'><rect width='1200' height='1200' fill='%2327170f'/><circle cx='600' cy='600' r='380' fill='%2378350f'/><circle cx='600' cy='600' r='280' fill='%23d97706'/></svg>",
    },
    {
      label: "Minimalist Tech",
      data: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='1200'><rect width='1200' height='1200' fill='%2309090b'/><rect x='300' y='300' width='600' height='600' rx='40' fill='%2318181b' stroke='%2327272a' stroke-width='10'/><circle cx='600' cy='600' r='140' fill='%2310b981'/></svg>",
    },
  ];

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setUserImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  const overrides: GenerationOverrides = {
    headline,
    subheadline,
    ctaText,
  };

  const activeLayout = selectedTemplate.layouts[selectedRatio];

  // Calculate zoom factor to fit comfortable preview container
  const maxPreviewWidth = 480;
  const zoomLevel = Math.min(1, maxPreviewWidth / activeLayout.width);

  async function handleGenerate() {
    if (!userImageBase64) {
      setErrorMsg(
        "Please upload an image or choose one of the sample textures below first.",
      );
      return;
    }

    if (credits < 1) {
      setErrorMsg(
        "You have 0 credits remaining. Please recharge your balance to continue.",
      );
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);
    setCompletedGeneration(null);

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
        setCredits((prev) => Math.max(0, prev - 1));
      } else {
        setErrorMsg(res.error || "Generation failed. Please try again.");
      }
    } catch (err: any) {
      setErrorMsg(
        err.message || "An unexpected error occurred during generation.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Social Content Studio
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Upload your photo, choose a layout, customize text, and generate 4
            branded social formats in seconds.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all cursor-pointer"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" /> Rendering All 4
              Formats...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" /> Generate All Formats (1 Credit)
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Studio Workspace: 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Controls & Customization (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Step 1: Upload Media */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Step 1: Content Image
              </span>
              {userImageBase64 && (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Image Selected
                </span>
              )}
            </div>

            <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-6 text-center hover:bg-slate-50 cursor-pointer transition-colors">
              <Upload className="h-8 w-8 text-slate-400 mb-2" />
              <span className="text-sm font-semibold text-slate-700">
                Click to upload product/photo
              </span>
              <span className="text-xs text-slate-400 mt-1">
                PNG, JPG, or WebP (recommended 1200x1200px+)
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            {/* Quick Sample Presets */}
            <div>
              <span className="text-xs text-slate-500 font-medium block mb-2">
                Or quick test with sample photo:
              </span>
              <div className="flex flex-wrap gap-2">
                {sampleImages.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setUserImageBase64(s.data)}
                    className="rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 2: Choose Template */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Step 2: Template
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {BUILTIN_TEMPLATES.length} templates
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {BUILTIN_TEMPLATES.map((tpl) => {
                const isSelected = selectedTemplate.id === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setSelectedTemplate(tpl)}
                    className={`flex items-start text-left gap-3.5 rounded-xl border p-3.5 transition-all cursor-pointer ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/50 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <Layers className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-900">
                          {tpl.name}
                        </span>
                        {isSelected && (
                          <Check className="h-4 w-4 text-blue-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                        {tpl.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Text & Copy Customization */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Step 3: Post Content & Overrides
            </span>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Main Headline
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Summer Essentials 2026"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Button Call-To-Action (CTA)
                </label>
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="e.g. Shop Now"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Interactive Preview (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-100/60 p-5 shadow-sm">
            {/* Aspect Ratio Switcher Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4 mb-4">
              <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl">
                {(Object.keys(ASPECT_RATIOS) as AspectRatioKey[]).map((key) => {
                  const meta = ASPECT_RATIOS[key];
                  const isSelected = selectedRatio === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedRatio(key)}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-white text-slate-900 shadow-sm font-semibold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <span>{meta.badge}</span>
                      <span className="hidden sm:inline">{meta.label}</span>
                    </button>
                  );
                })}
              </div>

              <span className="text-xs text-slate-400 font-mono">
                {activeLayout.width} x {activeLayout.height}px
              </span>
            </div>

            {/* Live Canvas */}
            <div className="flex items-center justify-center min-h-[500px] overflow-hidden">
              <CanvasPreview
                layout={activeLayout}
                brandKit={brandKit}
                userImageBase64={userImageBase64}
                overrides={overrides}
                brandName={brand.name}
                zoomLevel={zoomLevel}
              />
            </div>
          </div>
        </div>
      </div>

      {/* COMPLETED GENERATIONS SECTION */}
      {completedGeneration && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 shadow-sm space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <h2 className="text-lg font-bold text-slate-900">
                  Generation Ready: All 4 Formats Created!
                </h2>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Pixel-perfect PNGs rendered server-side with Sharp and stored in
                cloud storage.
              </p>
            </div>

            {/* Download All as ZIP Button */}
            <a
              href={`/api/exports/${completedGeneration.id}/zip`}
              download
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
            >
              <Archive className="h-4 w-4" /> Download All (ZIP Bundle)
            </a>
          </div>

          {/* Export Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {completedGeneration.exports?.map((exp: any) => {
              const meta = ASPECT_RATIOS[exp.aspectRatio as AspectRatioKey] || {
                badge: exp.aspectRatio,
                label: exp.aspectRatio,
              };

              return (
                <div
                  key={exp.id}
                  className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="relative aspect-square w-full rounded-lg bg-slate-100 overflow-hidden border border-slate-100 flex items-center justify-center">
                      <img
                        src={exp.url}
                        alt={meta.label}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">
                          {meta.badge} {meta.label}
                        </span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-600">
                          {exp.width}x{exp.height}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {(exp.fileSizeBytes / 1024).toFixed(1)} KB •{" "}
                        {exp.renderTimeMs || 120}ms
                      </span>
                    </div>
                  </div>

                  <a
                    href={exp.url}
                    download={`brandflow-${exp.aspectRatio.toLowerCase()}.png`}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5 text-slate-500" /> Download
                    PNG
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
