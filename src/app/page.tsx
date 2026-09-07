import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Palette,
  Download,
  Zap,
  CheckCircle2,
  Layers,
  Video,
  Image as ImageIcon,
  ShieldCheck,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500 selection:text-white">
      {/* 1. Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 text-white shadow-md shadow-blue-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Brand<span className="text-blue-500">Flow</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            <Link href="/dashboard/studio" className="hover:text-white transition-colors">
              Studio
            </Link>
            <Link href="/dashboard/brand" className="hover:text-white transition-colors">
              Brand Kit
            </Link>
            <Link href="/dashboard/templates" className="hover:text-white transition-colors">
              Templates
            </Link>
            <Link href="/dashboard/history" className="hover:text-white transition-colors">
              History
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/studio"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors"
            >
              Open Studio <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section: Focused on Core USP */}
      <section className="relative overflow-hidden pt-20 pb-16 sm:pt-28 sm:pb-24">
        {/* Ambient Glow */}
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="h-[450px] w-[650px] rounded-full bg-gradient-to-tr from-blue-600/25 via-indigo-600/20 to-teal-500/15 blur-[120px]" />
        </div>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-7">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-400">
            <Zap className="h-3.5 w-3.5" /> Content Automation & Brand Consistency
          </div>

          {/* Core USP Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
            “Set your brand once.{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300 bg-clip-text text-transparent">
              Brand every content automatically.”
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-400 leading-relaxed">
            Stop manually styling posts in Canva. Configure your brand colors, fonts, logo, and watermark once.
            Upload any image and instantly get all social media formats ready to publish.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
            <Link
              href="/dashboard/studio"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500 transition-all"
            >
              Enter Content Studio <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard/brand"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-3.5 text-base font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              <Palette className="h-4 w-4 text-blue-400" /> Configure Brand Kit
            </Link>
          </div>

          {/* The 4 Core Pillars */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-10 text-left">
            <div className="rounded-xl border border-slate-800/90 bg-slate-900/60 p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
                <ImageIcon className="h-4 w-4" /> Image → Content
              </div>
              <p className="text-xs text-slate-400">
                Turn any raw product shot into 4 branded social media formats in &lt;1 second.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800/90 bg-slate-900/60 p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                <Video className="h-4 w-4" /> Video → Branded
              </div>
              <p className="text-xs text-slate-400">
                Overlay lower-thirds, watermarks, and brand frames on reels & TikToks automatically.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800/90 bg-slate-900/60 p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider">
                <Layers className="h-4 w-4" /> Multi-Format
              </div>
              <p className="text-xs text-slate-400">
                Square (1:1), Stories (9:16), Portrait (4:5), and Banners (16:9) in one click.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800/90 bg-slate-900/60 p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="h-4 w-4" /> Brand Shield
              </div>
              <p className="text-xs text-slate-400">
                Consistent colors, typography, handles, and watermarks across your entire team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Simple 3-Step Automation Workflow */}
      <section className="border-t border-slate-800/80 bg-slate-900/40 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Simple 3-Step Automation
            </h2>
            <p className="text-sm text-slate-400">
              No complex design tools. Just consistent branding every time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                1
              </div>
              <h3 className="text-base font-bold text-white">Configure Brand Kit Once</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Add your logo, color palette, heading font, social handles (@instagram, website, phone), and watermark position.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
                2
              </div>
              <h3 className="text-base font-bold text-white">Upload Your Content</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Drop your photo or product image. BrandFlow automatically binds it into your layout with exact brand styling.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 font-bold">
                3
              </div>
              <h3 className="text-base font-bold text-white">Download All Formats (ZIP)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sharp composites all 4 resolutions server-side in under 1 second. Download individually or as a single ZIP bundle.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/dashboard/studio"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-6 py-3 text-sm font-bold text-white shadow-md transition-colors"
            >
              Try Studio Now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
