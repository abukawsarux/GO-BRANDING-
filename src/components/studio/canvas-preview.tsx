"use client";

import React from "react";
import {
  CanvasLayout,
  BrandKitData,
  GenerationOverrides,
  TextSlotElement,
  BadgeCtaElement,
  SocialFooterElement,
  DecorativeShapeElement,
  ImageSlotElement,
  BrandLogoElement,
} from "@/types/template";
import { resolveColorToken } from "@/core/rendering/svg-builder";

interface CanvasPreviewProps {
  layout: CanvasLayout;
  brandKit: BrandKitData;
  userImageBase64?: string | null;
  overrides?: GenerationOverrides;
  brandName?: string;
  zoomLevel?: number;
}

export function CanvasPreview({
  layout,
  brandKit,
  userImageBase64,
  overrides,
  brandName = "BrandFlow",
  zoomLevel = 1,
}: CanvasPreviewProps) {
  const { width, height, backgroundColor, elements } = layout;

  return (
    <div className="relative flex items-center justify-center p-4">
      <div
        className="relative shadow-2xl rounded-xl overflow-hidden border border-slate-200 bg-white transition-all duration-200"
        style={{
          width: `${width * zoomLevel}px`,
          height: `${height * zoomLevel}px`,
        }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full"
          style={{
            backgroundColor: backgroundColor.startsWith("#")
              ? backgroundColor
              : "#ffffff",
          }}
        >
          {elements.map((el) => {
            if (el.type === "IMAGE_SLOT") {
              const imageEl = el as ImageSlotElement;
              const hasImg = Boolean(userImageBase64);
              const rx = imageEl.borderRadius || 0;

              return (
                <g key={el.id}>
                  <clipPath id={`clip-${el.id}`}>
                    <rect
                      x={imageEl.x}
                      y={imageEl.y}
                      width={imageEl.width}
                      height={imageEl.height}
                      rx={rx}
                    />
                  </clipPath>

                  {hasImg ? (
                    <image
                      href={userImageBase64!}
                      x={imageEl.x}
                      y={imageEl.y}
                      width={imageEl.width}
                      height={imageEl.height}
                      preserveAspectRatio="xMidYMid slice"
                      clipPath={`url(#clip-${el.id})`}
                    />
                  ) : (
                    <g clipPath={`url(#clip-${el.id})`}>
                      <rect
                        x={imageEl.x}
                        y={imageEl.y}
                        width={imageEl.width}
                        height={imageEl.height}
                        fill="#F1F5F9"
                      />
                      <text
                        x={imageEl.x + imageEl.width / 2}
                        y={imageEl.y + imageEl.height / 2}
                        fill="#94A3B8"
                        fontSize={32}
                        fontWeight="600"
                        textAnchor="middle"
                        fontFamily="sans-serif"
                      >
                        Upload an image to preview
                      </text>
                    </g>
                  )}

                  {/* Gradient Overlay */}
                  {imageEl.gradientOverlay && (
                    <>
                      <defs>
                        <linearGradient
                          id={`grad-preview-${el.id}`}
                          x1="0%"
                          y1={
                            imageEl.gradientOverlay.direction === "to-top"
                              ? "100%"
                              : "0%"
                          }
                          x2="0%"
                          y2={
                            imageEl.gradientOverlay.direction === "to-top"
                              ? "0%"
                              : "100%"
                          }
                        >
                          <stop
                            offset="0%"
                            stopColor={imageEl.gradientOverlay.startColor}
                          />
                          <stop
                            offset="100%"
                            stopColor={imageEl.gradientOverlay.endColor}
                          />
                        </linearGradient>
                      </defs>
                      <rect
                        x={imageEl.x}
                        y={imageEl.y}
                        width={imageEl.width}
                        height={imageEl.height}
                        rx={rx}
                        fill={`url(#grad-preview-${el.id})`}
                      />
                    </>
                  )}
                </g>
              );
            }

            if (el.type === "DECORATIVE_SHAPE") {
              if (overrides?.showBackgroundShape === false) return null;
              const shapeEl = el as DecorativeShapeElement;
              const color = resolveColorToken(
                shapeEl.colorToken,
                brandKit,
                overrides,
                shapeEl.customColor,
              );
              const rx =
                shapeEl.borderRadius ||
                (shapeEl.shape === "pill" ? shapeEl.height / 2 : 0);

              return (
                <rect
                  key={el.id}
                  x={shapeEl.x}
                  y={shapeEl.y}
                  width={shapeEl.width}
                  height={shapeEl.height}
                  rx={rx}
                  ry={rx}
                  fill={color}
                  opacity={shapeEl.opacity ?? 1}
                />
              );
            }

            if (el.type === "BRAND_LOGO") {
              if (overrides?.showLogo === false) return null;
              const logoEl = el as BrandLogoElement;
              return (
                <g
                  key={el.id}
                  transform={`translate(${logoEl.x}, ${logoEl.y})`}
                >
                  {brandKit.primaryLogoUrl ? (
                    <image
                      href={brandKit.primaryLogoUrl}
                      width={logoEl.width}
                      height={logoEl.height}
                      preserveAspectRatio="xMidYMid meet"
                    />
                  ) : (
                    <text
                      x={0}
                      y={logoEl.height * 0.75}
                      fontSize={Math.min(logoEl.height * 0.65, 36)}
                      fontWeight="900"
                      fill={
                        logoEl.variant === "white"
                          ? "#FFFFFF"
                          : brandKit.primaryColor || "#0F172A"
                      }
                      fontFamily={brandKit.headingFont || "sans-serif"}
                      letterSpacing="0.05em"
                    >
                      {brandName.toUpperCase()}
                    </text>
                  )}
                </g>
              );
            }

            if (el.type === "TEXT_SLOT") {
              const textEl = el as TextSlotElement;
              let rawText = textEl.defaultText;
              if (textEl.role === "headline" && overrides?.headline) {
                rawText = overrides.headline;
              } else if (
                textEl.role === "subheadline" &&
                overrides?.subheadline
              ) {
                rawText = overrides.subheadline;
              }

              if (textEl.textTransform === "uppercase") {
                rawText = rawText.toUpperCase();
              }

              const color = resolveColorToken(
                textEl.colorToken,
                brandKit,
                overrides,
                textEl.customColor,
              );
              const font =
                textEl.fontToken === "heading"
                  ? brandKit.headingFont
                  : brandKit.bodyFont;
              const anchor =
                textEl.textAlign === "center"
                  ? "middle"
                  : textEl.textAlign === "right"
                    ? "end"
                    : "start";
              const anchorX =
                textEl.textAlign === "center"
                  ? textEl.x + textEl.width / 2
                  : textEl.textAlign === "right"
                    ? textEl.x + textEl.width
                    : textEl.x;

              const lines = rawText.split("\n");
              const lineHeight = textEl.lineHeight || textEl.fontSize * 1.25;

              return (
                <text
                  key={el.id}
                  x={anchorX}
                  y={textEl.y}
                  fontFamily={`'${font}', sans-serif, system-ui`}
                  fontSize={textEl.fontSize}
                  fontWeight={textEl.fontWeight}
                  fill={color}
                  textAnchor={anchor}
                >
                  {lines.map((line, idx) => (
                    <tspan
                      key={idx}
                      x={anchorX}
                      dy={idx === 0 ? textEl.fontSize : lineHeight}
                    >
                      {line}
                    </tspan>
                  ))}
                </text>
              );
            }

            if (el.type === "BADGE_CTA") {
              const badgeEl = el as BadgeCtaElement;
              const text =
                overrides?.ctaText ||
                badgeEl.defaultText ||
                brandKit.defaultCta ||
                "Learn More";
              const bgColor = resolveColorToken(
                badgeEl.bgToken,
                brandKit,
                overrides,
              );
              const textColor = resolveColorToken(
                badgeEl.textToken,
                brandKit,
                overrides,
              );
              const fontSize = badgeEl.fontSize || 22;
              const radius =
                badgeEl.borderRadius >= 999
                  ? badgeEl.height / 2
                  : badgeEl.borderRadius;

              return (
                <g
                  key={el.id}
                  transform={`translate(${badgeEl.x}, ${badgeEl.y})`}
                >
                  <rect
                    width={badgeEl.width}
                    height={badgeEl.height}
                    rx={radius}
                    ry={radius}
                    fill={bgColor}
                  />
                  <text
                    x={badgeEl.width / 2}
                    y={badgeEl.height / 2 + fontSize * 0.35}
                    fontFamily={`'${brandKit.bodyFont}', sans-serif`}
                    fontSize={fontSize}
                    fontWeight="700"
                    fill={textColor}
                    textAnchor="middle"
                  >
                    {text}
                  </text>
                </g>
              );
            }

            if (el.type === "SOCIAL_FOOTER") {
              if (
                overrides?.showSocialHandles === false &&
                overrides?.showPhoneNumber === false &&
                overrides?.showWebsite === false
              ) {
                return null;
              }
              const socialEl = el as SocialFooterElement;
              const color = resolveColorToken(
                socialEl.colorToken,
                brandKit,
                overrides,
              );
              const fontSize = socialEl.fontSize || 20;

              const itemsToShow: string[] = [];
              for (const item of socialEl.items) {
                if (item === "website" && brandKit.website && overrides?.showWebsite !== false) {
                  itemsToShow.push(
                    brandKit.website.replace(/^https?:\/\//, ""),
                  );
                } else if (item === "instagram" && brandKit.instagramHandle && overrides?.showSocialHandles !== false) {
                  const handle = brandKit.instagramHandle.startsWith("@")
                    ? brandKit.instagramHandle
                    : `@${brandKit.instagramHandle}`;
                  itemsToShow.push(handle);
                } else if (item === "facebook" && brandKit.facebookHandle && overrides?.showSocialHandles !== false) {
                  itemsToShow.push(`fb/${brandKit.facebookHandle}`);
                } else if (item === "tiktok" && brandKit.tiktokHandle && overrides?.showSocialHandles !== false) {
                  itemsToShow.push(`tiktok/${brandKit.tiktokHandle}`);
                } else if (item === "phone" && brandKit.phone && overrides?.showPhoneNumber !== false) {
                  itemsToShow.push(brandKit.phone);
                }
              }

              if (itemsToShow.length === 0) return null;

              return (
                <text
                  key={el.id}
                  x={socialEl.x}
                  y={socialEl.y + fontSize}
                  fontFamily={`'${brandKit.bodyFont}', sans-serif`}
                  fontSize={fontSize}
                  fontWeight="600"
                  fill={color}
                  opacity="0.9"
                >
                  {itemsToShow.join("  •  ")}
                </text>
              );
            }

            return null;
          })}

          {/* Watermark in preview */}
          {brandKit.watermarkEnabled && (
            <g
              transform={`translate(${
                brandKit.watermarkPosition === "BOTTOM_LEFT"
                  ? 40
                  : brandKit.watermarkPosition === "TOP_LEFT"
                    ? 40
                    : brandKit.watermarkPosition === "TOP_RIGHT"
                      ? width - 240
                      : brandKit.watermarkPosition === "CENTER"
                        ? width / 2 - 100
                        : width - 240
              }, ${
                brandKit.watermarkPosition === "TOP_LEFT" ||
                brandKit.watermarkPosition === "TOP_RIGHT"
                  ? 40
                  : brandKit.watermarkPosition === "CENTER"
                    ? height / 2 - 25
                    : height - 80
              })`}
              opacity={brandKit.watermarkOpacity ?? 0.8}
            >
              <rect width="200" height="48" rx="8" fill="rgba(15,23,42,0.6)" />
              <text
                x="100"
                y="30"
                fontSize="16"
                fontWeight="700"
                fill="#ffffff"
                textAnchor="middle"
                fontFamily="sans-serif"
              >
                ⚡ {brandName.toUpperCase()}
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
