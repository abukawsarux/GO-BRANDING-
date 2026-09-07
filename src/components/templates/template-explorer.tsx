"use client";

import React, { useState } from "react";
import { BUILTIN_TEMPLATES } from "@/core/templates/catalog";
import {
  TemplateDefinition,
  ASPECT_RATIOS,
  AspectRatioKey,
} from "@/types/template";
import { Sparkles, ArrowRight, Tag } from "lucide-react";
import Link from "next/link";

export function TemplateExplorer() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { key: "all", label: "All Templates" },
    { key: "products", label: "Product & Minimal" },
    { key: "promotions", label: "Flash Sales & Promos" },
    { key: "lifestyle", label: "Restaurant & Lifestyle" },
  ];

  const filteredTemplates =
    selectedCategory === "all"
      ? BUILTIN_TEMPLATES
      : BUILTIN_TEMPLATES.filter((t) => t.category === selectedCategory);

  return (
    <div className="space-y-8 pb-16">
      {/* Title & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            BrandFlow Template Catalog
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pre-designed, high-converting social layouts with responsive 1:1,
            9:16, 4:5, and 16:9 slots.
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100/60 p-1">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setSelectedCategory(c.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                selectedCategory === c.key
                  ? "bg-white text-slate-900 shadow-sm font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((tpl) => (
          <div
            key={tpl.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                  <Tag className="h-3 w-3" /> {tpl.category}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  4 Formats
                </span>
              </div>

              <h2 className="text-base font-bold text-slate-900">{tpl.name}</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                {tpl.description}
              </p>
            </div>

            {/* Supported Ratios badges */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(ASPECT_RATIOS) as AspectRatioKey[]).map((r) => (
                  <span
                    key={r}
                    className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                  >
                    {ASPECT_RATIOS[r].badge}
                  </span>
                ))}
              </div>

              <Link
                href={`/dashboard/studio`}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
              >
                Use in Studio <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
