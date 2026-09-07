"use client";

import React from "react";
import {
  Download,
  Archive,
  Calendar,
  Layers,
  Image as ImageIcon,
} from "lucide-react";
import { ASPECT_RATIOS, AspectRatioKey } from "@/types/template";

interface GenerationHistoryProps {
  generations: any[];
}

export function GenerationHistory({ generations }: GenerationHistoryProps) {
  if (!generations || generations.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4">
          <ImageIcon className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">No Generations Yet</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
          Head over to the Studio to upload your first image and generate
          multi-format branded social assets.
        </p>
        <a
          href="/dashboard/studio"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          Open Content Studio
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Generated Content History
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Access and re-download all past generated social media assets and ZIP
          bundles.
        </p>
      </div>

      <div className="space-y-6">
        {generations.map((gen) => {
          const dateStr = new Date(gen.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={gen.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5"
            >
              {/* Post Meta & ZIP Download */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {gen.title || "Untitled Post"}
                  </h2>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {dateStr}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5 text-slate-400" />
                      {gen.brand?.name || "Brand"}
                    </span>
                    <span>•</span>
                    <span className="font-medium text-emerald-600">
                      {gen.exports?.length || 0} formats
                    </span>
                  </div>
                </div>

                <a
                  href={`/api/exports/${gen.id}/zip`}
                  download
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <Archive className="h-4 w-4 text-slate-500" /> Download ZIP
                </a>
              </div>

              {/* Exports Preview Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {gen.exports?.map((exp: any) => {
                  const meta = ASPECT_RATIOS[
                    exp.aspectRatio as AspectRatioKey
                  ] || {
                    badge: exp.aspectRatio,
                    label: exp.aspectRatio,
                  };

                  return (
                    <div
                      key={exp.id}
                      className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 space-y-2.5 flex flex-col justify-between"
                    >
                      <div className="relative aspect-square w-full rounded-lg bg-white overflow-hidden border border-slate-200 flex items-center justify-center">
                        <img
                          src={exp.url}
                          alt={meta.label}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-800">
                            {meta.badge}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {exp.width}x{exp.height}
                          </span>
                        </div>
                        <a
                          href={exp.url}
                          download
                          className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-lg bg-white border border-slate-200 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
                        >
                          <Download className="h-3 w-3 text-slate-400" />{" "}
                          Download
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
