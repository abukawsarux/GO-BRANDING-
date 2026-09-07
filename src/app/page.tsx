import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Layers,
  Palette,
  Download,
  Shield,
  Zap,
  CheckCircle,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500 selection:text-white">
      {/* Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 text-white shadow-md shadow-blue-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Brand<span className="text-blue-500">Flow</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/studio"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
            >
              Launch Studio <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-20 sm:pt-32 sm:pb-28">
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="h-[500px] w-[700px] rounded-full bg-gradient-to-tr from-blue-600/20 via-indigo-600/20 to-purple-600/10 blur-[130px]" />
        </div>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-400">
            <Zap className="h-3.5 w-3.5" /> Automated Branded Social Content
            Engine
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Create Consistently Branded Social Media Content in{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300 bg-clip-text text-transparent">
              One Single Click
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-400 leading-relaxed">
            Set up your Brand Kit once — colors, typography, logos, social
            handles, and watermarks. Upload any image and instantly generate
            pixel-perfect posts across Square, Stories, Reels, and Banners.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/dashboard/studio"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500 transition-all"
            >
              Open Content Studio <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard/brand"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-3.5 text-base font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              <Palette className="h-4 w-4 text-blue-400" /> Configure Brand Kit
            </Link>
          </div>

          {/* Social Proof Pills */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-400" /> Square 1:1
              Feed
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-400" /> Story & Reel
              9:16
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-400" /> Portrait 4:5
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-400" /> Banner 16:9
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-400" /> 1-Click ZIP
              Download
            </span>
          </div>
        </div>
      </section>

      {/* 3 Step Workflow */}
      <section className="border-t border-slate-800 bg-slate-900/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              How BrandFlow Works
            </h2>
            <p className="text-sm text-slate-400">
              Eliminate hours of manual Canva editing and fragmented brand
              assets across teams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Palette className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">
                1. Configure Brand Kit
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Save your logo, primary/secondary palettes, typography, contact
                details, social handles, and watermark once.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">
                2. Upload & Pick Template
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Upload your raw product shot or lifestyle photo and select from
                high-converting launch templates.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                <Download className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">
                3. Batch Render & Export
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Sharp renders all 4 social resolutions server-side in under 1
                second. Download individually or as a single ZIP bundle.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
