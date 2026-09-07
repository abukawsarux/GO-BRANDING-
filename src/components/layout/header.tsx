"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Palette, Layers, History, Coins } from "lucide-react";

interface HeaderProps {
  workspaceName: string;
  brandName: string;
  credits: number;
}

export function DashboardHeader({
  workspaceName,
  brandName,
  credits,
}: HeaderProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Studio", href: "/", icon: Sparkles },
    { label: "Brand Kit", href: "/dashboard/brand", icon: Palette },
    { label: "Templates", href: "/dashboard/templates", icon: Layers },
    { label: "History", href: "/dashboard/history", icon: History },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* BrandFlow Logo & Workspace Context */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 text-white shadow-md shadow-blue-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Brand<span className="text-blue-600">Flow</span>
              </span>
              <span className="hidden sm:inline-block ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                MVP
              </span>
            </div>
          </Link>

          {/* Active Workspace / Brand Pill */}
          <div className="hidden md:flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-xs">
            <span className="font-semibold text-slate-700">
              {workspaceName}
            </span>
            <span className="text-slate-300">•</span>
            <span className="font-medium text-blue-600">{brandName}</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/" || pathname === "/dashboard/studio"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${isActive ? "text-blue-600" : "text-slate-400"}`}
                />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Credit Meter & Quick Action */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50/80 px-3 py-1.5 text-xs font-semibold text-amber-900">
            <Coins className="h-3.5 w-3.5 text-amber-600" />
            <span>{credits}</span>
            <span className="hidden sm:inline font-normal text-amber-700">
              credits
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
