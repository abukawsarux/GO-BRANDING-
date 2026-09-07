"use client";

import React, { useState } from "react";
import { updateBrandKitAction } from "@/server-actions/brand-kit-actions";
import {
  Palette,
  Type,
  Globe,
  Shield,
  Save,
  Check,
  Sparkles,
} from "lucide-react";
import { WatermarkPosition } from "@prisma/client";

interface BrandKitEditorProps {
  brand: {
    id: string;
    name: string;
    slug: string;
    brandKit: {
      primaryColor: string;
      secondaryColor: string;
      accentColor: string;
      backgroundColor: string;
      textColor: string;
      headingFont: string;
      bodyFont: string;
      primaryLogoUrl?: string | null;
      website?: string | null;
      phone?: string | null;
      email?: string | null;
      defaultCta?: string | null;
      instagramHandle?: string | null;
      facebookHandle?: string | null;
      tiktokHandle?: string | null;
      watermarkEnabled: boolean;
      watermarkPosition: WatermarkPosition;
      watermarkOpacity: number;
    } | null;
  };
}

export function BrandKitEditor({ brand }: BrandKitEditorProps) {
  const kit = brand.brandKit;

  const [primaryColor, setPrimaryColor] = useState(
    kit?.primaryColor || "#0F172A",
  );
  const [secondaryColor, setSecondaryColor] = useState(
    kit?.secondaryColor || "#3B82F6",
  );
  const [accentColor, setAccentColor] = useState(kit?.accentColor || "#F59E0B");
  const [backgroundColor, setBackgroundColor] = useState(
    kit?.backgroundColor || "#FFFFFF",
  );
  const [textColor, setTextColor] = useState(kit?.textColor || "#0F172A");

  const [headingFont, setHeadingFont] = useState(kit?.headingFont || "Inter");
  const [bodyFont, setBodyFont] = useState(kit?.bodyFont || "Inter");

  const [website, setWebsite] = useState(kit?.website || "");
  const [phone, setPhone] = useState(kit?.phone || "");
  const [email, setEmail] = useState(kit?.email || "");
  const [defaultCta, setDefaultCta] = useState(kit?.defaultCta || "Shop Now");

  const [instagramHandle, setInstagramHandle] = useState(
    kit?.instagramHandle || "",
  );
  const [facebookHandle, setFacebookHandle] = useState(
    kit?.facebookHandle || "",
  );
  const [tiktokHandle, setTiktokHandle] = useState(kit?.tiktokHandle || "");

  const [watermarkEnabled, setWatermarkEnabled] = useState(
    kit?.watermarkEnabled ?? true,
  );
  const [watermarkPosition, setWatermarkPosition] = useState<WatermarkPosition>(
    kit?.watermarkPosition || "BOTTOM_RIGHT",
  );
  const [watermarkOpacity, setWatermarkOpacity] = useState(
    kit?.watermarkOpacity ?? 0.85,
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await updateBrandKitAction({
        brandId: brand.id,
        primaryColor,
        secondaryColor,
        accentColor,
        backgroundColor,
        textColor,
        headingFont,
        bodyFont,
        website,
        phone,
        email,
        defaultCta,
        instagramHandle,
        facebookHandle,
        tiktokHandle,
        watermarkEnabled,
        watermarkPosition,
        watermarkOpacity,
      });

      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save brand kit:", err);
    } finally {
      setIsSaving(false);
    }
  }

  const fontOptions = [
    "Inter",
    "Montserrat",
    "Playfair Display",
    "Poppins",
    "Roboto",
    "Open Sans",
    "Lato",
    "Oswald",
  ];

  return (
    <form onSubmit={handleSave} className="space-y-8 pb-12">
      {/* Top Banner & Save Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Brand Kit: {brand.name}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure your brand identity once. Every template automatically
            adopts these colors, fonts, and handles.
          </p>
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saveSuccess ? (
            <>
              <Check className="h-4 w-4 text-white" /> Saved Successfully!
            </>
          ) : isSaving ? (
            "Saving..."
          ) : (
            <>
              <Save className="h-4 w-4" /> Save Brand Kit
            </>
          )}
        </button>
      </div>

      {/* Section 1: Color Palette */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2.5 text-slate-900 font-semibold text-lg mb-4">
          <Palette className="h-5 w-5 text-blue-600" />
          <h2>Brand Color Palette</h2>
        </div>
        <p className="text-sm text-slate-500 mb-6">
          These colors will automatically skin templates, badges, background
          cards, and text overlays.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Primary */}
          <div className="rounded-xl border border-slate-200 p-4 space-y-2">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Primary Color
            </span>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-10 w-10 cursor-pointer rounded-lg border border-slate-300 p-0.5"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-24 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm font-mono"
              />
            </div>
          </div>

          {/* Secondary */}
          <div className="rounded-xl border border-slate-200 p-4 space-y-2">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Secondary Color
            </span>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="h-10 w-10 cursor-pointer rounded-lg border border-slate-300 p-0.5"
              />
              <input
                type="text"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="w-24 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm font-mono"
              />
            </div>
          </div>

          {/* Accent */}
          <div className="rounded-xl border border-slate-200 p-4 space-y-2">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Accent Color
            </span>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="h-10 w-10 cursor-pointer rounded-lg border border-slate-300 p-0.5"
              />
              <input
                type="text"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-24 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm font-mono"
              />
            </div>
          </div>

          {/* Background */}
          <div className="rounded-xl border border-slate-200 p-4 space-y-2">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Canvas Background
            </span>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="h-10 w-10 cursor-pointer rounded-lg border border-slate-300 p-0.5"
              />
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-24 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm font-mono"
              />
            </div>
          </div>

          {/* Text Color */}
          <div className="rounded-xl border border-slate-200 p-4 space-y-2">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Default Text
            </span>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="h-10 w-10 cursor-pointer rounded-lg border border-slate-300 p-0.5"
              />
              <input
                type="text"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-24 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm font-mono"
              />
            </div>
          </div>
        </div>

        {/* Live Color Bar Preview */}
        <div className="mt-6 p-4 rounded-xl border border-slate-100 bg-slate-50">
          <span className="text-xs font-semibold text-slate-500 mb-2 block">
            Brand Harmony Preview
          </span>
          <div className="h-10 rounded-lg overflow-hidden flex shadow-inner">
            <div
              style={{ backgroundColor: primaryColor }}
              className="flex-1"
              title="Primary"
            />
            <div
              style={{ backgroundColor: secondaryColor }}
              className="flex-1"
              title="Secondary"
            />
            <div
              style={{ backgroundColor: accentColor }}
              className="flex-1"
              title="Accent"
            />
            <div
              style={{ backgroundColor: backgroundColor }}
              className="flex-1 border"
              title="Background"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Typography */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2.5 text-slate-900 font-semibold text-lg mb-4">
          <Type className="h-5 w-5 text-indigo-600" />
          <h2>Typography</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Heading Font
            </label>
            <select
              value={headingFont}
              onChange={(e) => setHeadingFont(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {fontOptions.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Body & Detail Font
            </label>
            <select
              value={bodyFont}
              onChange={(e) => setBodyFont(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {fontOptions.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Section 3: Business Details & Social Handles */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2.5 text-slate-900 font-semibold text-lg mb-4">
          <Globe className="h-5 w-5 text-emerald-600" />
          <h2>Contact & Social Footers</h2>
        </div>
        <p className="text-sm text-slate-500 mb-6">
          These details are automatically placed in the footer ribbons and
          contact badges across social posts.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">
              Website URL
            </label>
            <input
              type="text"
              placeholder="e.g. luminacraft.co"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">
              Phone / WhatsApp
            </label>
            <input
              type="text"
              placeholder="+1 (555) 019-2834"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">
              Email
            </label>
            <input
              type="email"
              placeholder="hello@luminacraft.co"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">
              Instagram Handle
            </label>
            <input
              type="text"
              placeholder="@luminacraft"
              value={instagramHandle}
              onChange={(e) => setInstagramHandle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">
              Facebook Page/Handle
            </label>
            <input
              type="text"
              placeholder="luminacraft"
              value={facebookHandle}
              onChange={(e) => setFacebookHandle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">
              TikTok Handle
            </label>
            <input
              type="text"
              placeholder="@luminacraft"
              value={tiktokHandle}
              onChange={(e) => setTiktokHandle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-5 pt-5 border-t border-slate-100">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">
            Default Button Call-To-Action (CTA)
          </label>
          <input
            type="text"
            placeholder="e.g. Shop Collection, Book Table, Order Online, Learn More"
            value={defaultCta}
            onChange={(e) => setDefaultCta(e.target.value)}
            className="w-full sm:w-1/2 rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Section 4: Watermark Settings */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5 text-slate-900 font-semibold text-lg">
            <Shield className="h-5 w-5 text-amber-500" />
            <h2>Brand Protection & Watermark</h2>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={watermarkEnabled}
              onChange={(e) => setWatermarkEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {watermarkEnabled && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Watermark Position
              </label>
              <select
                value={watermarkPosition}
                onChange={(e) =>
                  setWatermarkPosition(e.target.value as WatermarkPosition)
                }
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="BOTTOM_RIGHT">Bottom Right (Standard)</option>
                <option value="BOTTOM_LEFT">Bottom Left</option>
                <option value="TOP_RIGHT">Top Right</option>
                <option value="TOP_LEFT">Top Left</option>
                <option value="CENTER">Center Overlay</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Opacity: {Math.round(watermarkOpacity * 100)}%
              </label>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={watermarkOpacity}
                onChange={(e) =>
                  setWatermarkOpacity(parseFloat(e.target.value))
                }
                className="w-full mt-2"
              />
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
