export type AspectRatioKey = "SQUARE_1_1" | "STORY_9_16" | "PORTRAIT_4_5" | "LANDSCAPE_16_9";

export interface AspectRatioMeta {
  key: AspectRatioKey;
  label: string;
  sublabel: string;
  width: number;
  height: number;
  ratioFraction: number; // width / height
  badge: string;
}

export const ASPECT_RATIOS: Record<AspectRatioKey, AspectRatioMeta> = {
  SQUARE_1_1: {
    key: "SQUARE_1_1",
    label: "Square",
    sublabel: "Instagram / Facebook Post",
    width: 1080,
    height: 1080,
    ratioFraction: 1,
    badge: "1:1",
  },
  STORY_9_16: {
    key: "STORY_9_16",
    label: "Story & Reel",
    sublabel: "Instagram / TikTok / Shorts",
    width: 1080,
    height: 1920,
    ratioFraction: 9 / 16,
    badge: "9:16",
  },
  PORTRAIT_4_5: {
    key: "PORTRAIT_4_5",
    label: "Portrait",
    sublabel: "Instagram Feed (High Visibility)",
    width: 1080,
    height: 1350,
    ratioFraction: 4 / 5,
    badge: "4:5",
  },
  LANDSCAPE_16_9: {
    key: "LANDSCAPE_16_9",
    label: "Landscape",
    sublabel: "Twitter / Facebook / LinkedIn",
    width: 1920,
    height: 1080,
    ratioFraction: 16 / 9,
    badge: "16:9",
  },
};

export type ElementType =
  | "IMAGE_SLOT"
  | "BRAND_LOGO"
  | "TEXT_SLOT"
  | "BADGE_CTA"
  | "SOCIAL_FOOTER"
  | "DECORATIVE_SHAPE";

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number; // Pixels relative to canvas
  y: number;
  width: number;
  height: number;
  zIndex: number;
  opacity?: number;
}

export interface ImageSlotElement extends BaseElement {
  type: "IMAGE_SLOT";
  fit: "cover" | "contain";
  borderRadius?: number;
  gradientOverlay?: {
    direction: "to-bottom" | "to-top";
    startColor: string;
    endColor: string;
  };
}

export interface BrandLogoElement extends BaseElement {
  type: "BRAND_LOGO";
  variant?: "primary" | "dark" | "white";
  preserveAspect: boolean;
}

export interface TextSlotElement extends BaseElement {
  type: "TEXT_SLOT";
  role: "headline" | "subheadline" | "body" | "tagline";
  defaultText: string;
  fontToken: "heading" | "body";
  colorToken: "primary" | "secondary" | "accent" | "text" | "white" | "custom";
  customColor?: string;
  fontSize: number;
  fontWeight: 400 | 500 | 600 | 700 | 800 | 900;
  textAlign: "left" | "center" | "right";
  lineHeight?: number;
  letterSpacing?: number;
  textTransform?: "none" | "uppercase" | "capitalize";
}

export interface BadgeCtaElement extends BaseElement {
  type: "BADGE_CTA";
  defaultText?: string;
  bgToken: "accent" | "secondary" | "primary" | "white" | "dark";
  textToken: "white" | "primary" | "dark";
  borderRadius: number;
  paddingX?: number;
  paddingY?: number;
  fontSize?: number;
}

export interface SocialFooterElement extends BaseElement {
  type: "SOCIAL_FOOTER";
  items: ("instagram" | "facebook" | "tiktok" | "website" | "phone")[];
  layout: "horizontal" | "vertical";
  colorToken: "secondary" | "text" | "primary" | "white" | "dark";
  fontSize: number;
  gap?: number;
}

export interface DecorativeShapeElement extends BaseElement {
  type: "DECORATIVE_SHAPE";
  shape: "rectangle" | "circle" | "pill" | "line";
  colorToken: "primary" | "secondary" | "accent" | "white" | "dark";
  customColor?: string;
  borderRadius?: number;
}

export type CanvasElement =
  | ImageSlotElement
  | BrandLogoElement
  | TextSlotElement
  | BadgeCtaElement
  | SocialFooterElement
  | DecorativeShapeElement;

export interface CanvasLayout {
  width: number;
  height: number;
  backgroundColor: string; // e.g., "#ffffff", "#0F172A", or "$brand.background"
  backgroundGradient?: {
    from: string;
    to: string;
    angleDeg?: number;
  };
  elements: CanvasElement[];
}

export interface TemplateDefinition {
  id: string;
  name: string;
  category: "promotions" | "announcements" | "quotes" | "products" | "lifestyle";
  description: string;
  thumbnailUrl: string;
  layouts: {
    SQUARE_1_1: CanvasLayout;
    STORY_9_16: CanvasLayout;
    PORTRAIT_4_5: CanvasLayout;
    LANDSCAPE_16_9: CanvasLayout;
  };
}

export interface BrandKitData {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  headingFont: string;
  bodyFont: string;
  primaryLogoUrl?: string | null;
  darkLogoUrl?: string | null;
  whiteLogoUrl?: string | null;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  defaultCta?: string | null;
  instagramHandle?: string | null;
  facebookHandle?: string | null;
  tiktokHandle?: string | null;
  watermarkEnabled?: boolean;
  watermarkUrl?: string | null;
  watermarkPosition?: "TOP_LEFT" | "TOP_RIGHT" | "BOTTOM_LEFT" | "BOTTOM_RIGHT" | "CENTER";
  watermarkOpacity?: number;
}

export interface GenerationOverrides {
  headline?: string;
  subheadline?: string;
  ctaText?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  customImagePosition?: { x: number; y: number; zoom: number };
  showLogo?: boolean;
  showSocialHandles?: boolean;
  showPhoneNumber?: boolean;
  showWebsite?: boolean;
  showBackgroundShape?: boolean;
}

