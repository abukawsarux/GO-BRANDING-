import {
  CanvasLayout,
  BrandKitData,
  GenerationOverrides,
  TextSlotElement,
  BadgeCtaElement,
  SocialFooterElement,
  DecorativeShapeElement,
} from "@/types/template";

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}

export function resolveColorToken(
  token: string | undefined,
  brandKit: BrandKitData,
  overrides?: GenerationOverrides,
  customColor?: string
): string {
  if (customColor) return customColor;
  if (!token) return brandKit.textColor || "#1E293B";

  switch (token) {
    case "primary":
      return overrides?.primaryColor || brandKit.primaryColor || "#0F172A";
    case "secondary":
      return overrides?.secondaryColor || brandKit.secondaryColor || "#3B82F6";
    case "accent":
      return overrides?.accentColor || brandKit.accentColor || "#10B981";
    case "white":
      return "#FFFFFF";
    case "dark":
      return "#0F172A";
    case "text":
      return brandKit.textColor || "#1E293B";
    default:
      return token.startsWith("#") ? token : brandKit.primaryColor;
  }
}

export function buildSvgOverlay(
  layout: CanvasLayout,
  brandKit: BrandKitData,
  overrides?: GenerationOverrides
): string {
  const elementsSvg: string[] = [];

  for (const el of layout.elements) {
    if (el.type === "IMAGE_SLOT") {
      if (el.gradientOverlay) {
        const gradId = `grad_${el.id}`;
        const isToTop = el.gradientOverlay.direction === "to-top";
        const y1 = isToTop ? "100%" : "0%";
        const y2 = isToTop ? "0%" : "100%";

        elementsSvg.push(`
          <defs>
            <linearGradient id="${gradId}" x1="0%" y1="${y1}" x2="0%" y2="${y2}">
              <stop offset="0%" stop-color="${el.gradientOverlay.startColor}" />
              <stop offset="100%" stop-color="${el.gradientOverlay.endColor}" />
            </linearGradient>
          </defs>
          <rect 
            x="${el.x}" 
            y="${el.y}" 
            width="${el.width}" 
            height="${el.height}" 
            rx="${el.borderRadius || 0}" 
            ry="${el.borderRadius || 0}" 
            fill="url(#${gradId})" 
          />
        `);
      }
      continue;
    }

    if (el.type === "DECORATIVE_SHAPE") {
      if (overrides?.showBackgroundShape === false) continue;
      const shapeEl = el as DecorativeShapeElement;
      const color = resolveColorToken(shapeEl.colorToken, brandKit, overrides, shapeEl.customColor);
      const rx = shapeEl.borderRadius || (shapeEl.shape === "pill" ? shapeEl.height / 2 : 0);

      elementsSvg.push(`
        <rect 
          x="${shapeEl.x}" 
          y="${shapeEl.y}" 
          width="${shapeEl.width}" 
          height="${shapeEl.height}" 
          rx="${rx}" 
          ry="${rx}" 
          fill="${color}" 
          opacity="${shapeEl.opacity ?? 1}"
        />
      `);
      continue;
    }

    if (el.type === "TEXT_SLOT") {
      const textEl = el as TextSlotElement;
      let rawText = textEl.defaultText;

      if (textEl.role === "headline" && overrides?.headline) {
        rawText = overrides.headline;
      } else if (textEl.role === "subheadline" && overrides?.subheadline) {
        rawText = overrides.subheadline;
      }

      if (textEl.textTransform === "uppercase") {
        rawText = rawText.toUpperCase();
      }

      const color = resolveColorToken(textEl.colorToken, brandKit, overrides, textEl.customColor);
      const font = textEl.fontToken === "heading" ? brandKit.headingFont : brandKit.bodyFont;
      const anchor = textEl.textAlign === "center" ? "middle" : textEl.textAlign === "right" ? "end" : "start";
      const anchorX =
        textEl.textAlign === "center"
          ? textEl.x + textEl.width / 2
          : textEl.textAlign === "right"
          ? textEl.x + textEl.width
          : textEl.x;

      const lines = rawText.split("\n");
      const lineHeight = textEl.lineHeight || textEl.fontSize * 1.25;

      const tspans = lines
        .map((line, idx) => {
          const dy = idx === 0 ? textEl.fontSize : lineHeight;
          return `<tspan x="${anchorX}" dy="${dy}">${escapeXml(line)}</tspan>`;
        })
        .join("");

      elementsSvg.push(`
        <text 
          x="${anchorX}" 
          y="${textEl.y}" 
          font-family="'${font}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" 
          font-size="${textEl.fontSize}" 
          font-weight="${textEl.fontWeight}" 
          fill="${color}" 
          text-anchor="${anchor}"
        >${tspans}</text>
      `);
      continue;
    }

    if (el.type === "BADGE_CTA") {
      const badgeEl = el as BadgeCtaElement;
      const text = overrides?.ctaText || badgeEl.defaultText || brandKit.defaultCta || "Learn More";
      const bgColor = resolveColorToken(badgeEl.bgToken, brandKit, overrides);
      const textColor = resolveColorToken(badgeEl.textToken, brandKit, overrides);
      const fontSize = badgeEl.fontSize || 22;
      const font = brandKit.bodyFont || "sans-serif";
      const radius = badgeEl.borderRadius >= 999 ? badgeEl.height / 2 : badgeEl.borderRadius;

      elementsSvg.push(`
        <g transform="translate(${badgeEl.x}, ${badgeEl.y})">
          <rect 
            width="${badgeEl.width}" 
            height="${badgeEl.height}" 
            rx="${radius}" 
            ry="${radius}" 
            fill="${bgColor}" 
          />
          <text 
            x="${badgeEl.width / 2}" 
            y="${badgeEl.height / 2 + fontSize * 0.35}" 
            font-family="'${font}', -apple-system, BlinkMacSystemFont, sans-serif" 
            font-size="${fontSize}" 
            font-weight="700" 
            fill="${textColor}" 
            text-anchor="middle"
          >${escapeXml(text)}</text>
        </g>
      `);
      continue;
    }

    if (el.type === "SOCIAL_FOOTER") {
      if (overrides?.showSocialHandles === false && overrides?.showPhoneNumber === false && overrides?.showWebsite === false) {
        continue;
      }
      const socialEl = el as SocialFooterElement;
      const color = resolveColorToken(socialEl.colorToken, brandKit, overrides);
      const font = brandKit.bodyFont || "sans-serif";
      const fontSize = socialEl.fontSize || 20;

      const itemsToShow: string[] = [];
      for (const item of socialEl.items) {
        if (item === "website" && brandKit.website && overrides?.showWebsite !== false) {
          itemsToShow.push(brandKit.website.replace(/^https?:\/\//, ""));
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

      if (itemsToShow.length > 0) {
        const joinedText = itemsToShow.join("  •  ");
        elementsSvg.push(`
          <text 
            x="${socialEl.x}" 
            y="${socialEl.y + fontSize}" 
            font-family="'${font}', -apple-system, BlinkMacSystemFont, sans-serif" 
            font-size="${fontSize}" 
            font-weight="600" 
            fill="${color}" 
            opacity="0.9"
          >${escapeXml(joinedText)}</text>
        `);
      }
      continue;
    }
  }

  return `<svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="${layout.width}" 
    height="${layout.height}" 
    viewBox="0 0 ${layout.width} ${layout.height}"
  >
    ${elementsSvg.join("\n")}
  </svg>`;
}

