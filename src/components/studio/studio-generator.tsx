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
  Maximize2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Image as ImageIcon,
  Video,
  Home,
  Layers,
  FolderHeart,
  Briefcase,
  Users,
  CreditCard,
  Settings,
  Bell,
  Coins,
  Check,
  ChevronDown,
  X,
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

// Sneaker vector matching the exact athletic runner from user design board
const SNEAKER_SAMPLE = `data:image/svg+xml;base64,${btoa(`
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
    <defs>
      <linearGradient id="shoe-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1e293b"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
      <linearGradient id="sole-grad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#f8fafc"/>
        <stop offset="50%" stop-color="#e2e8f0"/>
        <stop offset="100%" stop-color="#ffffff"/>
      </linearGradient>
      <linearGradient id="knit-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#334155"/>
        <stop offset="100%" stop-color="#090d16"/>
      </linearGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
        <feDropShadow dx="0" dy="40" stdDeviation="35" flood-color="#000000" flood-opacity="0.6"/>
      </filter>
    </defs>
    <rect width="1200" height="1200" fill="url(#shoe-bg)"/>
    <circle cx="600" cy="560" r="380" fill="#38bdf8" opacity="0.12" filter="blur(40px)"/>
    <g filter="url(#shadow)" transform="translate(180, 320)">
      <!-- Sole -->
      <path d="M 80 340 C 160 355 300 370 520 365 C 680 360 740 330 760 290 C 740 315 670 340 520 345 C 320 350 180 335 100 315 C 80 320 75 330 80 340 Z" fill="url(#sole-grad)"/>
      <path d="M 90 320 C 160 335 320 345 520 345 C 680 345 740 310 755 285 L 750 260 C 730 280 660 310 520 315 C 320 320 180 305 110 285 Z" fill="#0284c7" opacity="0.9"/>
      <!-- Upper Body -->
      <path d="M 120 280 C 150 220 240 180 360 160 C 440 145 500 110 560 60 C 580 90 620 120 650 160 C 710 200 740 240 750 265 C 720 285 640 310 520 315 C 320 320 180 305 120 280 Z" fill="url(#knit-grad)"/>
      <!-- Heel collar & laces -->
      <path d="M 520 80 C 540 120 550 150 560 190 C 510 195 450 210 380 230" stroke="#f8fafc" stroke-width="8" stroke-linecap="round" fill="none" opacity="0.85"/>
      <path d="M 480 120 C 500 150 510 180 520 210" stroke="#38bdf8" stroke-width="6" stroke-linecap="round" fill="none"/>
      <path d="M 440 150 C 460 180 470 200 480 230" stroke="#38bdf8" stroke-width="6" stroke-linecap="round" fill="none"/>
      <!-- Swoosh / Accent wave -->
      <path d="M 280 260 C 400 240 520 220 620 170 C 560 210 460 250 320 275 Z" fill="#0284c7"/>
    </g>
  </svg>
`)}`;

export function StudioGenerator({
  workspaceId,
  brand,
  brandKit,
  initialCredits,
}: StudioGeneratorProps) {
  // Main state
  const [activeTab, setActiveTab] = useState<"image" | "video">("image");
  const [userImageBase64, setUserImageBase64] = useState<string>(SNEAKER_SAMPLE);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDefinition>(
    BUILTIN_TEMPLATES[0]
  );
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  // Overrides matching mockup
  const [headline, setHeadline] = useState("STYLE THAT MOVES WITH YOU");
  const [ctaText, setCtaText] = useState("SHOP NOW");

  // Elements Checkboxes (from mockup)
  const [showLogo, setShowLogo] = useState(true);
  const [showSocialHandles, setShowSocialHandles] = useState(true);
  const [showPhoneNumber, setShowPhoneNumber] = useState(true);
  const [showWebsite, setShowWebsite] = useState(true);
  const [showBackgroundShape, setShowBackgroundShape] = useState(true);

  // Status state
  const [isGenerating, setIsGenerating] = useState(false);
  const [credits, setCredits] = useState(initialCredits);
  const [completedGeneration, setCompletedGeneration] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const overrides: GenerationOverrides = {
    headline,
    ctaText,
    showLogo,
    showSocialHandles,
    showPhoneNumber,
    showWebsite,
    showBackgroundShape,
  };

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

  async function handleGenerateAllFormats() {
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const res = await generateSocialFormatsAction({
        workspaceId,
        brandId: brand.id,
        templateId: selectedTemplate.id,
        imageBase64: userImageBase64,
        title: headline.replace(/\n/g, " "),
        overrides,
      });

      if (res.success && res.data) {
        setCompletedGeneration(res.data);
        setCredits((c) => Math.max(0, c - 1));
      } else {
        setErrorMessage(res.error || "Generation failed. Please try again.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleDownloadZip() {
    if (!completedGeneration) {
      handleGenerateAllFormats();
      return;
    }
    const zipUrl = `/api/exports/${completedGeneration.id}/zip`;
    const link = document.createElement("a");
    link.href = zipUrl;
    link.download = `${brand.name.toLowerCase()}-branded-assets.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // 5 Formats matching mockup
  const formatCards = [
    {
      key: "SQUARE_1_1" as AspectRatioKey,
      label: "Instagram Post",
      ratio: "1:1 (1080×1080)",
      aspectRatioKey: "SQUARE_1_1" as AspectRatioKey,
    },
    {
      key: "STORY_9_16" as AspectRatioKey,
      label: "Instagram Story",
      ratio: "9:16 (1080×1920)",
      aspectRatioKey: "STORY_9_16" as AspectRatioKey,
    },
    {
      key: "SQUARE_1_1" as AspectRatioKey,
      label: "Facebook Post",
      ratio: "1:1 (1080×1080)",
      aspectRatioKey: "SQUARE_1_1" as AspectRatioKey,
    },
    {
      key: "STORY_9_16" as AspectRatioKey,
      label: "TikTok",
      ratio: "9:16 (1080×1920)",
      aspectRatioKey: "STORY_9_16" as AspectRatioKey,
    },
    {
      key: "LANDSCAPE_16_9" as AspectRatioKey,
      label: "YouTube Thumbnail",
      ratio: "16:9 (1280×720)",
      aspectRatioKey: "LANDSCAPE_16_9" as AspectRatioKey,
    },
  ];

  const templateCategories = [
    "All",
    "Product",
    "Offer",
    "New Arrival",
    "Sale",
    "Story",
    "Minimal",
    "Premium",
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* ========================================================================= */}
      {/* 1. LEFT SIDEBAR                                                           */}
      {/* ========================================================================= */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col justify-between hidden lg:flex shrink-0">
        <div>
          {/* Logo */}
          <div className="h-16 flex items-center gap-2.5 px-6 border-b border-slate-100">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 text-white font-black text-base shadow-sm">
              B
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              Brand<span className="text-indigo-600">Flow</span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 text-sm font-medium">
            <Link
              href="/"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <Home className="h-4 w-4 text-slate-400" />
              <span>Overview</span>
            </Link>

            <Link
              href="/"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-indigo-50 text-indigo-700 font-semibold transition-colors"
            >
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span>Create Content</span>
            </Link>

            <Link
              href="/dashboard/templates"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <Layers className="h-4 w-4 text-slate-400" />
              <span>Templates</span>
            </Link>

            <Link
              href="/dashboard/brand"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <Palette className="h-4 w-4 text-slate-400" />
              <span>Brand Kit</span>
            </Link>

            <Link
              href="/dashboard/history"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <FolderHeart className="h-4 w-4 text-slate-400" />
              <span>My Content</span>
            </Link>

            <div className="pt-4 pb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Management
            </div>

            <Link
              href="/dashboard/brand"
              className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-xs"
            >
              <Briefcase className="h-3.5 w-3.5 text-slate-400" />
              <span>Brands</span>
            </Link>

            <button
              type="button"
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-xs text-left"
            >
              <Users className="h-3.5 w-3.5 text-slate-400" />
              <span>Team</span>
            </button>

            <button
              type="button"
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-xs text-left"
            >
              <CreditCard className="h-3.5 w-3.5 text-slate-400" />
              <span>Billing</span>
            </button>

            <button
              type="button"
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-xs text-left"
            >
              <Settings className="h-3.5 w-3.5 text-slate-400" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Workspace Pill at Bottom of Sidebar */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 bg-slate-50">
            <div className="h-9 w-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
              UW
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-xs font-bold text-slate-900 truncate">
                {brand.name}
              </span>
              <span className="block text-[10px] text-slate-500 font-medium">
                Workspace • Pro Plan
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MAIN APPLICATION WORKSPACE                                             */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white font-black text-base">
              B
            </div>
            <span className="font-bold text-slate-900">BrandFlow</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <span>Workspace:</span>
            <span className="font-bold text-slate-800">{brand.name}</span>
          </div>

          {/* Right Header Badges */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
              <span>{credits} credits left</span>
            </div>

            <button
              type="button"
              className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-white" />
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="h-8 w-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                S
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
          {/* Main Title & Video/Image Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Create Branded Content
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload your image or video, choose a template, and generate stunning branded content.
              </p>
            </div>

            {/* Image / Video Tab Switcher */}
            <div className="inline-flex rounded-xl bg-slate-100 p-1 self-start">
              <button
                type="button"
                onClick={() => setActiveTab("image")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "image"
                    ? "bg-white text-indigo-700 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <ImageIcon className="h-3.5 w-3.5" />
                <span>Image</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("video")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "video"
                    ? "bg-white text-indigo-700 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Video className="h-3.5 w-3.5" />
                <span>Video</span>
                <span className="ml-1 rounded bg-indigo-50 text-indigo-600 px-1 py-0.2 text-[9px]">
                  Soon
                </span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3-COLUMN CREATION STUDIO GRID                                             */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* COLUMN 1: Upload Box & Quick Start (3 Cols) */}
            <div className="lg:col-span-3 space-y-4">
              {/* Dashed Upload Box */}
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-6 text-center space-y-3 flex flex-col items-center justify-center min-h-[220px]">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-900">
                    Upload your image
                  </span>
                  <span className="block text-[11px] text-slate-400 mt-0.5">
                    Drag & drop or click to upload
                  </span>
                  <span className="block text-[10px] text-slate-400">
                    JPG, PNG, WebP (max 10MB)
                  </span>
                </div>

                <label className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-semibold text-white cursor-pointer shadow-sm transition-colors">
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Quick Start List */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
                <span className="text-xs font-bold text-slate-900 block">
                  Quick Start
                </span>
                <ol className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2.5">
                    <span className="h-5 w-5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                      1
                    </span>
                    <span>Upload your image</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="h-5 w-5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                      2
                    </span>
                    <span>Choose a template</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="h-5 w-5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                      3
                    </span>
                    <span>Preview & customize</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="h-5 w-5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                      4
                    </span>
                    <span>Generate in multiple formats</span>
                  </li>
                </ol>
              </div>
            </div>

            {/* COLUMN 2: Big Live Preview with "From this To this" Annotation (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
              {/* Curved annotation pointer */}
              <div className="hidden sm:block absolute -top-3 left-6 text-indigo-600 font-cursive italic text-xs rotate-[-8deg] z-10 select-none">
                From this <br />
                To this <br />
                in seconds! ➔
              </div>

              {/* Live Preview Card */}
              <div className="w-full max-w-[400px]">
                <CanvasPreview
                  layout={selectedTemplate.layouts.SQUARE_1_1}
                  brandKit={brandKit}
                  userImageBase64={userImageBase64}
                  overrides={overrides}
                  brandName={brand.name}
                  zoomLevel={Math.min(1, 380 / selectedTemplate.layouts.SQUARE_1_1.width)}
                />
              </div>
            </div>

            {/* COLUMN 3: Edit Content Panel (4 Cols) */}
            <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <span className="text-xs font-bold text-slate-900 block border-b border-slate-100 pb-2">
                Edit Content
              </span>

              {/* Product Image Thumbnail + Replace */}
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="h-10 w-10 rounded-lg bg-slate-900 overflow-hidden shrink-0 flex items-center justify-center">
                  <img
                    src={userImageBase64}
                    alt="Product"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold text-slate-800">
                    Product Image
                  </span>
                  <label className="text-[11px] text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer">
                    Replace image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Text Inputs */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-600 uppercase">
                  Text
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="STYLE THAT MOVES WITH YOU"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="SHOP NOW"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Elements Checkboxes */}
              <div className="space-y-2 pt-1">
                <label className="block text-[11px] font-bold text-slate-600 uppercase">
                  Elements
                </label>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showLogo}
                      onChange={(e) => setShowLogo(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                    />
                    <span>Logo</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showSocialHandles}
                      onChange={(e) => setShowSocialHandles(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                    />
                    <span>Social Handles</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showPhoneNumber}
                      onChange={(e) => setShowPhoneNumber(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                    />
                    <span>Phone Number</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showWebsite}
                      onChange={(e) => setShowWebsite(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                    />
                    <span>Website</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showBackgroundShape}
                      onChange={(e) => setShowBackgroundShape(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                    />
                    <span>Background Shape</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    const nextIdx =
                      (BUILTIN_TEMPLATES.findIndex((t) => t.id === selectedTemplate.id) + 1) %
                      BUILTIN_TEMPLATES.length;
                    setSelectedTemplate(BUILTIN_TEMPLATES[nextIdx]);
                  }}
                  className="w-full inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 py-2 text-xs font-semibold text-slate-700 transition-colors"
                >
                  Change Template
                </button>

                <button
                  type="button"
                  onClick={handleGenerateAllFormats}
                  disabled={isGenerating}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-2.5 text-xs font-bold shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Generating Formats...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Generate All Formats</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* BOTTOM SECTION: CHOOSE A TEMPLATE + GENERATED FORMATS                     */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-4 border-t border-slate-200">
            {/* Left: Choose a Template (6 Cols) */}
            <div className="lg:col-span-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">
                  Choose a Template
                </span>
                <Link
                  href="/dashboard/templates"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  View All
                </Link>
              </div>

              {/* Categories Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {templateCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`rounded-lg px-2.5 py-1 font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      categoryFilter === cat
                        ? "bg-indigo-600 text-white font-bold"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Horizontal Template Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {BUILTIN_TEMPLATES.map((tpl) => {
                  const isSelected = selectedTemplate.id === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      onClick={() => setSelectedTemplate(tpl)}
                      className={`rounded-xl border overflow-hidden p-1.5 text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20 shadow-xs"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="aspect-square w-full rounded-lg bg-slate-900 overflow-hidden flex items-center justify-center relative">
                        <div
                          className="w-full h-full flex flex-col justify-end p-2 text-white"
                          style={{
                            backgroundColor:
                              tpl.layouts.SQUARE_1_1.backgroundColor.startsWith("#")
                                ? tpl.layouts.SQUARE_1_1.backgroundColor
                                : "#0F172A",
                          }}
                        >
                          <span className="text-[9px] font-black uppercase line-clamp-2 leading-tight">
                            {tpl.name}
                          </span>
                        </div>
                      </div>
                      <span className="block text-[10px] font-semibold text-slate-700 mt-1 truncate">
                        {tpl.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Generated Formats (6 Cols) */}
            <div className="lg:col-span-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">
                    Generated Formats
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                    <CheckCircle2 className="h-3 w-3" /> Your content is ready!
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadZip}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition-colors cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download All (ZIP)</span>
                </button>
              </div>

              {/* 5 Format Cards Horizontal Row */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {formatCards.map((card, idx) => {
                  const layout = selectedTemplate.layouts[card.aspectRatioKey];
                  const zoom = 140 / layout.width;

                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-200 bg-white p-2 space-y-1.5 shadow-2xs flex flex-col justify-between"
                    >
                      <div className="rounded-lg bg-slate-900 overflow-hidden flex items-center justify-center aspect-[4/5] p-1">
                        <CanvasPreview
                          layout={layout}
                          brandKit={brandKit}
                          userImageBase64={userImageBase64}
                          overrides={overrides}
                          brandName={brand.name}
                          zoomLevel={zoom}
                        />
                      </div>
                      <div>
                        <span className="block text-[11px] font-bold text-slate-900 truncate">
                          {card.label}
                        </span>
                        <span className="block text-[9px] text-slate-400 font-mono">
                          {card.ratio}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>

        {/* Footer Bar matching design */}
        <footer className="border-t border-slate-200 bg-slate-900 text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs mt-auto">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-indigo-500 text-white font-black text-[10px]">
              B
            </div>
            <span className="font-bold">BrandFlow</span>
            <span className="text-slate-400">• Branding for a bigger tomorrow.</span>
          </div>

          <div className="flex items-center gap-4 text-slate-300">
            <span className="hidden md:inline">More Brands. Better Content. Faster Growth.</span>
            <button
              onClick={handleDownloadZip}
              className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3 py-1 text-xs font-bold text-white transition-colors"
            >
              Get Started Today
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
