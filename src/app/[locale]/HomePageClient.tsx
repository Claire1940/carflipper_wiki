"use client";

import { useState, Suspense, lazy } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Box,
  Building2,
  Car,
  Check,
  ChevronDown,
  Clock,
  Cog,
  Compass,
  Crown,
  DollarSign,
  ExternalLink,
  Flag,
  Gauge,
  Gift,
  Globe,
  Hammer,
  Info,
  ListChecks,
  Package,
  Palette,
  Rocket,
  ShoppingCart,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  Target,
  Ticket,
  TrendingUp,
  Warehouse,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useMessages } from "next-intl";
import { VideoFeature } from "@/components/home/VideoFeature";
import { LatestGuidesAccordion } from "@/components/home/LatestGuidesAccordion";
import { NativeBannerAd, AdBanner } from "@/components/ads";
import { getPreferredMobileBannerSelection } from "@/components/ads/mobileAdConfigs";
import { scrollToSection } from "@/lib/scrollToSection";
import type { ContentItemWithType } from "@/lib/getLatestArticles";
import type { ModuleLinkMap } from "@/lib/buildModuleLinkMap";

// Lazy load heavy components
const HeroStats = lazy(() => import("@/components/home/HeroStats"));
const FAQSection = lazy(() => import("@/components/home/FAQSection"));
const CTASection = lazy(() => import("@/components/home/CTASection"));

// Loading placeholder
const LoadingPlaceholder = ({ height = "h-64" }: { height?: string }) => (
  <div
    className={`${height} bg-white/5 border border-border rounded-xl animate-pulse`}
  />
);

// Conditionally render text as a link or plain span (renders plain text when no link)
function LinkedTitle({
  linkData,
  children,
  className,
  locale,
}: {
  linkData: { url: string; title: string } | null | undefined;
  children: React.ReactNode;
  className?: string;
  locale: string;
}) {
  if (linkData) {
    const href = locale === "en" ? linkData.url : `/${locale}${linkData.url}`;
    return (
      <Link
        href={href}
        className={`${className || ""} hover:text-[hsl(var(--nav-theme-light))] hover:underline decoration-[hsl(var(--nav-theme-light))/0.4] underline-offset-4 transition-colors`}
        title={linkData.title}
      >
        {children}
      </Link>
    );
  }
  return <>{children}</>;
}

// Reusable module header (icon + title + subtitle + intro)
function ModuleHeader({
  Icon,
  title,
  subtitle,
  intro,
  linkData,
  locale,
}: {
  Icon: LucideIcon;
  title: string;
  subtitle?: string;
  intro?: string;
  linkData: { url: string; title: string } | null | undefined;
  locale: string;
}) {
  return (
    <div className="text-center mb-10 md:mb-14 scroll-reveal">
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-xl bg-[hsl(var(--nav-theme)/0.12)] border border-[hsl(var(--nav-theme)/0.3)]">
          <Icon className="h-5 w-5 md:h-6 md:w-6 text-[hsl(var(--nav-theme-light))]" />
        </div>
        <h2 className="text-3xl md:text-5xl font-bold leading-tight">
          <LinkedTitle linkData={linkData} locale={locale}>
            {title}
          </LinkedTitle>
        </h2>
      </div>
      {subtitle && (
        <p className="text-base md:text-lg text-[hsl(var(--nav-theme-light))] font-medium max-w-3xl mx-auto mb-3">
          {subtitle}
        </p>
      )}
      {intro && (
        <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
          {intro}
        </p>
      )}
    </div>
  );
}

// Reusable accordion item
function AccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
  Icon,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  Icon: LucideIcon;
}) {
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-white/[0.02]">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-5 text-left hover:bg-white/5 transition-colors"
      >
        <Icon className="w-5 h-5 text-[hsl(var(--nav-theme-light))] flex-shrink-0" />
        <span className="font-semibold flex-1">{question}</span>
        <ChevronDown
          className={`w-5 h-5 flex-shrink-0 text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <p className="px-5 pb-5 pl-13 text-muted-foreground text-sm leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  );
}

interface HomePageClientProps {
  latestArticles: ContentItemWithType[];
  moduleLinkMap: ModuleLinkMap;
  locale: string;
}

export default function HomePageClient({
  latestArticles,
  moduleLinkMap,
  locale,
}: HomePageClientProps) {
  const t = useMessages() as any;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.carflipper.wiki";

  // Tools Grid: code-side icon map (full lucide library, no registry dependency)
  const toolsGridIcons: LucideIcon[] = [
    Gift,
    Globe,
    Compass,
    Wrench,
    Car,
    Gauge,
    Warehouse,
    Flag,
  ];
  const toolsGridSectionIds = [
    "codes",
    "official-links",
    "beginner-guide",
    "tuning-shop",
    "tier-list",
    "upgrades",
    "workshop",
    "racing",
  ];

  // Per-card distinct icons for card-based modules
  const officialLinkIcons: LucideIcon[] = [Globe, Building2, Tag];
  const officialInfoIcons: LucideIcon[] = [Tag, Cog, Car, TrendingUp, ShieldCheck];
  const tierIcons: LucideIcon[] = [Crown, TrendingUp, Gauge, Hammer, Sparkles];
  const upgradeRowIcons: LucideIcon[] = [Wrench, Palette, Gauge, Sparkles, Rocket];
  const workshopCardIcons: LucideIcon[] = [
    ShoppingCart,
    Wrench,
    Palette,
    DollarSign,
    Star,
    Building2,
  ];

  // Accordion states
  const [faqExpanded, setFaqExpanded] = useState<number | null>(0);
  const [tuningExpanded, setTuningExpanded] = useState<number | null>(0);
  const [racingExpanded, setRacingExpanded] = useState<number | null>(0);
  const mobileBannerAd = getPreferredMobileBannerSelection();

  // Structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Car Flipper Wiki",
        description:
          "Car Flipper Wiki covers codes, vehicle repair, tuning shop upgrades, car customization, workshop expansion, racing basics, and Roblox beginner help.",
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "Car Flipper - Roblox Car Repair and Flipping Simulator",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Car Flipper Wiki",
        alternateName: "Car Flipper",
        url: siteUrl,
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/android-chrome-512x512.png`,
          width: 512,
          height: 512,
        },
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "Car Flipper Wiki - Roblox Car Repair and Flipping Simulator",
        },
        sameAs: [
          "https://www.roblox.com/games/136533956395153/Car-Flipper",
          "https://www.roblox.com/communities/11553831/A-B-Group",
          "https://www.youtube.com/watch?v=YK8IBprhp50",
        ],
      },
      {
        "@type": "VideoGame",
        name: "Car Flipper",
        gamePlatform: ["Roblox", "PC", "Mobile", "Console"],
        applicationCategory: "Game",
        genre: ["Simulation", "Tycoon", "Roleplay"],
        numberOfPlayers: {
          minValue: 1,
          maxValue: 14,
        },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: "https://www.roblox.com/games/136533956395153/Car-Flipper",
        },
      },
      {
        "@type": "VideoObject",
        name: "Roblox Repair a Car is AMAZING - Car Flipper Gameplay",
        description:
          "Car Flipper gameplay walkthrough: buy damaged cars, repair them, customize and tune parts, then sell builds for profit in Roblox.",
        thumbnailUrl: `${siteUrl}/images/hero.webp`,
        embedUrl: "https://www.youtube.com/embed/YK8IBprhp50",
        url: "https://www.youtube.com/watch?v=YK8IBprhp50",
      },
    ],
  };

  return (
    <div className="home-shell min-h-screen bg-background text-foreground">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* 广告位 1: 顶部固定横幅 */}
      <div className="sticky top-20 z-20 border-b border-border py-2">
        <AdBanner type="banner-320x50" adKey={process.env.NEXT_PUBLIC_AD_MOBILE_320X50} />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-24 pb-14 md:pt-32 md:pb-20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 scroll-reveal">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 md:px-4 md:py-2
                            bg-[hsl(var(--nav-theme)/0.1)]
                            border border-[hsl(var(--nav-theme)/0.3)] mb-4 md:mb-6"
            >
              <Sparkles className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
              <span className="text-xs md:text-sm font-medium">
                {t.hero.badge}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-6 leading-[1.05]">
              {t.hero.title}
            </h1>

            {/* Description */}
            <p className="mx-auto mb-8 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg md:mb-10 md:max-w-3xl md:text-2xl">
              {t.hero.description}
            </p>

            {/* CTA Buttons */}
            <div className="mb-10 flex flex-col justify-center gap-3 sm:flex-row md:mb-12 md:gap-4">
              <button
                onClick={() => scrollToSection("codes")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4
                           bg-[hsl(var(--nav-theme))] hover:bg-[hsl(var(--nav-theme)/0.9)]
                           text-white rounded-lg font-semibold text-base md:text-lg transition-colors"
              >
                <Gift className="w-5 h-5" />
                {t.hero.getFreeCodesCTA}
              </button>
              <a
                href="https://www.roblox.com/games/136533956395153/Car-Flipper"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4
                           border border-border hover:bg-white/10 rounded-lg
                           font-semibold text-base md:text-lg transition-colors"
              >
                {t.hero.playOnRobloxCTA}
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Stats */}
          <Suspense fallback={<LoadingPlaceholder height="h-32" />}>
            <HeroStats stats={Object.values(t.hero.stats)} />
          </Suspense>
        </div>
      </section>

      {/* Video Section - 紧跟 Hero 区域，保证播放宽度（max-w-5xl ≈ 1024px） */}
      <section className="px-4 py-10 md:py-12">
        <div className="scroll-reveal container mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-2xl">
            <VideoFeature
              videoId="YK8IBprhp50"
              title="Roblox Repair a Car is AMAZING - Car Flipper Gameplay"
            />
          </div>
        </div>
      </section>

      {/* Tools Grid - 8 Navigation Cards（位于视频区之后、Latest Updates 之前） */}
      <section className="px-4 py-14 md:py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.tools.title}{" "}
              <span className="text-[hsl(var(--nav-theme-light))]">
                {t.tools.titleHighlight}
              </span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground">
              {t.tools.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {t.tools.cards.map((card: any, index: number) => {
              const Icon = toolsGridIcons[index];
              return (
                <button
                  key={index}
                  onClick={() => scrollToSection(toolsGridSectionIds[index])}
                  className="scroll-reveal group rounded-xl border border-border p-4 md:p-6
                             bg-card hover:border-[hsl(var(--nav-theme)/0.5)]
                             transition-all duration-300 cursor-pointer text-left
                             hover:shadow-lg hover:shadow-[hsl(var(--nav-theme)/0.1)]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className="mb-3 h-10 w-10 rounded-lg md:mb-4 md:h-12 md:w-12
                                bg-[hsl(var(--nav-theme)/0.1)]
                                flex items-center justify-center
                                group-hover:bg-[hsl(var(--nav-theme)/0.2)]
                                transition-colors"
                  >
                    <Icon className="h-5 w-5 md:h-6 md:w-6 text-[hsl(var(--nav-theme-light))]" />
                  </div>
                  <h3 className="mb-1.5 text-sm md:text-base font-semibold">
                    {card.title}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {card.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Latest Updates Section */}
      <LatestGuidesAccordion
        articles={latestArticles}
        locale={locale}
        max={12}
      />

      {/* 广告位 2: 首屏内容之后再加载广告 */}
      <NativeBannerAd adKey={process.env.NEXT_PUBLIC_AD_NATIVE_BANNER || ""} />

      {/* 广告位 3: 移动端优先使用方形，桌面端保留横幅 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Module 1: Codes and Redeem Guide */}
      <section id="codes" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            Icon={Gift}
            title={t.modules.carFlipperCodes.title}
            subtitle={t.modules.carFlipperCodes.subtitle}
            intro={t.modules.carFlipperCodes.intro}
            linkData={moduleLinkMap["carFlipperCodes"]}
            locale={locale}
          />

          {/* Active Codes */}
          <div className="scroll-reveal mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Check className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
              <h3 className="font-bold text-lg md:text-xl">
                {t.modules.carFlipperCodes.activeLabel}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {t.modules.carFlipperCodes.activeCodes.map((code: any, i: number) => {
                const Icon = [Ticket, Tag][i] || Ticket;
                return (
                  <div
                    key={i}
                    className="p-5 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
                      <span className="font-mono font-bold text-lg tracking-wide bg-[hsl(var(--nav-theme)/0.12)] border border-[hsl(var(--nav-theme)/0.3)] px-3 py-1 rounded-md">
                        {code.code}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {code.reward}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]">
                      <Package className="w-3 h-3" />
                      {code.rewardType}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Expired Codes */}
          <div className="scroll-reveal mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-bold text-lg md:text-xl text-muted-foreground">
                {t.modules.carFlipperCodes.expiredLabel}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {t.modules.carFlipperCodes.expiredCodes.map((code: any, i: number) => (
                <div
                  key={i}
                  className="p-5 bg-white/[0.02] border border-border/60 rounded-xl opacity-80"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-5 h-5 text-muted-foreground" />
                    <span className="font-mono font-bold text-base tracking-wide line-through text-muted-foreground px-3 py-1 rounded-md border border-border">
                      {code.code}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{code.reward}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Redeem Steps + Reward Types */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Redeem Steps */}
            <div className="scroll-reveal p-5 md:p-6 bg-[hsl(var(--nav-theme)/0.05)] border border-[hsl(var(--nav-theme)/0.3)] rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <ListChecks className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
                <h3 className="font-bold text-base md:text-lg">
                  {t.modules.carFlipperCodes.stepsLabel}
                </h3>
              </div>
              <ol className="space-y-4">
                {t.modules.carFlipperCodes.redeemSteps.map(
                  (step: any, i: number) => (
                    <li key={i} className="flex gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 border-[hsl(var(--nav-theme)/0.5)] bg-[hsl(var(--nav-theme)/0.15)]">
                        <span className="text-sm font-bold text-[hsl(var(--nav-theme-light))]">
                          {i + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{step.title}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {step.description}
                        </p>
                      </div>
                    </li>
                  ),
                )}
              </ol>
            </div>

            {/* Reward Types */}
            <div className="scroll-reveal p-5 md:p-6 bg-white/5 border border-border rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
                <h3 className="font-bold text-base md:text-lg">
                  {t.modules.carFlipperCodes.rewardLabel}
                </h3>
              </div>
              <div className="space-y-4">
                {t.modules.carFlipperCodes.rewardTypes.map((rt: any, i: number) => {
                  const Icon = [Box, Cog][i] || Box;
                  return (
                    <div key={i}>
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
                        <p className="font-semibold text-sm">{rt.title}</p>
                      </div>
                      <p className="text-sm text-muted-foreground pl-6">
                        {rt.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 广告位 4: 第一模块之后的阅读停顿位 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-468x60"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_468X60}
        className="hidden md:flex"
      />

      {/* Module 2: Official Links and Game Info */}
      <section
        id="official-links"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            Icon={Globe}
            title={t.modules.carFlipperOfficialLinks.title}
            subtitle={t.modules.carFlipperOfficialLinks.subtitle}
            intro={t.modules.carFlipperOfficialLinks.intro}
            linkData={moduleLinkMap["carFlipperOfficialLinks"]}
            locale={locale}
          />

          {/* Official Channels */}
          <div className="scroll-reveal mb-10">
            <div className="flex items-center gap-2 mb-4">
              <ExternalLink className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
              <h3 className="font-bold text-lg md:text-xl">
                {t.modules.carFlipperOfficialLinks.linksLabel}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {t.modules.carFlipperOfficialLinks.links.map((link: any, i: number) => {
                const Icon = officialLinkIcons[i] || Globe;
                return (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group p-5 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] hover:bg-[hsl(var(--nav-theme)/0.04)] transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--nav-theme)/0.1)] group-hover:bg-[hsl(var(--nav-theme)/0.2)] transition-colors">
                        <Icon className="h-5 w-5 text-[hsl(var(--nav-theme-light))]" />
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <h4 className="font-bold mb-1">{link.title}</h4>
                    <p className="text-sm text-[hsl(var(--nav-theme-light))] font-medium mb-2">
                      {link.label}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {link.description}
                    </p>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Game Info */}
          <div className="scroll-reveal">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
              <h3 className="font-bold text-lg md:text-xl">
                {t.modules.carFlipperOfficialLinks.infoLabel}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {t.modules.carFlipperOfficialLinks.info.map((info: any, i: number) => {
                const Icon = officialInfoIcons[i] || Info;
                return (
                  <div
                    key={i}
                    className="p-5 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
                      <h4 className="font-bold text-sm">{info.title}</h4>
                    </div>
                    <p className="text-sm font-medium text-[hsl(var(--nav-theme-light))] mb-2">
                      {info.label}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {info.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Module 3: Beginner Guide */}
      <section id="beginner-guide" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            Icon={Compass}
            title={t.modules.carFlipperBeginnerGuide.title}
            subtitle={t.modules.carFlipperBeginnerGuide.subtitle}
            intro={t.modules.carFlipperBeginnerGuide.intro}
            linkData={moduleLinkMap["carFlipperBeginnerGuide"]}
            locale={locale}
          />

          <div className="scroll-reveal relative pl-8 md:pl-10 border-l-2 border-[hsl(var(--nav-theme)/0.3)] space-y-5 md:space-y-6">
            {t.modules.carFlipperBeginnerGuide.steps.map((step: any, i: number) => (
              <div key={i} className="relative">
                <div className="absolute -left-[2.1rem] md:-left-[2.6rem] w-9 h-9 md:w-10 md:h-10 rounded-full bg-[hsl(var(--nav-theme))] border-2 border-background flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{i + 1}</span>
                </div>
                <div className="p-5 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors">
                  <h3 className="text-lg md:text-xl font-bold mb-1.5">
                    {step.title}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground mb-2">
                    {step.description}
                  </p>
                  <div className="flex items-start gap-2 mt-2">
                    <Target className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-medium text-[hsl(var(--nav-theme-light))]">
                      {step.playerGoal}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Module 4: Tuning Shop Guide */}
      <section
        id="tuning-shop"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            Icon={Wrench}
            title={t.modules.carFlipperTuningShop.title}
            subtitle={t.modules.carFlipperTuningShop.subtitle}
            intro={t.modules.carFlipperTuningShop.intro}
            linkData={moduleLinkMap["carFlipperTuningShop"]}
            locale={locale}
          />

          <div className="scroll-reveal space-y-3 max-w-3xl mx-auto">
            {t.modules.carFlipperTuningShop.items.map((item: any, i: number) => (
              <AccordionItem
                key={i}
                question={item.title}
                answer={item.content}
                isOpen={tuningExpanded === i}
                onToggle={() =>
                  setTuningExpanded(tuningExpanded === i ? null : i)
                }
                Icon={Wrench}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Module 5: Best Cars and Vehicle Tier List */}
      <section id="tier-list" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            Icon={Car}
            title={t.modules.carFlipperTierList.title}
            subtitle={t.modules.carFlipperTierList.subtitle}
            intro={t.modules.carFlipperTierList.intro}
            linkData={moduleLinkMap["carFlipperTierList"]}
            locale={locale}
          />

          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.modules.carFlipperTierList.tiers.map((tier: any, i: number) => {
              const Icon = tierIcons[i] || Star;
              return (
                <div
                  key={i}
                  className="p-5 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[hsl(var(--nav-theme)/0.12)] border border-[hsl(var(--nav-theme)/0.3)]">
                      <Icon className="h-5 w-5 text-[hsl(var(--nav-theme-light))]" />
                    </div>
                    <div>
                      <span className="inline-block text-xs font-mono font-bold px-2 py-0.5 rounded bg-[hsl(var(--nav-theme))] text-white">
                        {tier.tier}
                      </span>
                      <h3 className="font-bold text-base mt-1">{tier.label}</h3>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
                        {t.modules.carFlipperTierList.scopeLabel}
                      </p>
                      <p className="text-sm">{tier.vehicleScope}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                        {t.modules.carFlipperTierList.bestForLabel}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {tier.bestFor.map((bf: string, bi: number) => (
                          <span
                            key={bi}
                            className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.25)]"
                          >
                            {bf}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-start gap-2 pt-1">
                      <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">
                        {tier.playerAction}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 广告位 5: 移动端横幅 */}
      {mobileBannerAd && (
        <AdBanner
          type={mobileBannerAd.type}
          adKey={mobileBannerAd.adKey}
          className="md:hidden"
        />
      )}

      {/* Module 6: Parts and Performance Upgrades */}
      <section
        id="upgrades"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            Icon={Gauge}
            title={t.modules.carFlipperUpgrades.title}
            subtitle={t.modules.carFlipperUpgrades.subtitle}
            intro={t.modules.carFlipperUpgrades.intro}
            linkData={moduleLinkMap["carFlipperUpgrades"]}
            locale={locale}
          />

          {/* Desktop table */}
          <div className="scroll-reveal hidden md:block overflow-x-auto">
            <table className="w-full border border-border rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-[hsl(var(--nav-theme)/0.1)]">
                  <th className="text-left p-4 font-semibold">
                    {t.modules.carFlipperUpgrades.colCategory}
                  </th>
                  <th className="text-left p-4 font-semibold">
                    {t.modules.carFlipperUpgrades.colRole}
                  </th>
                  <th className="text-left p-4 font-semibold">
                    {t.modules.carFlipperUpgrades.colBestFor}
                  </th>
                  <th className="text-left p-4 font-semibold">
                    {t.modules.carFlipperUpgrades.colPriority}
                  </th>
                </tr>
              </thead>
              <tbody>
                {t.modules.carFlipperUpgrades.rows.map((row: any, i: number) => {
                  const Icon = upgradeRowIcons[i] || Wrench;
                  return (
                    <tr
                      key={i}
                      className="border-t border-border hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="p-4 align-top">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-[hsl(var(--nav-theme-light))] flex-shrink-0" />
                          <span className="font-bold">{row.category}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1.5 pl-6">
                          {row.impact}
                        </p>
                      </td>
                      <td className="p-4 align-top text-sm text-muted-foreground">
                        {row.role}
                      </td>
                      <td className="p-4 align-top text-sm text-muted-foreground">
                        {row.bestUsedFor}
                      </td>
                      <td className="p-4 align-top text-sm">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]">
                          <Check className="w-3 h-3 text-[hsl(var(--nav-theme-light))]" />
                          {row.recommendedPriority}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile stacked rows */}
          <div className="scroll-reveal md:hidden space-y-4">
            {t.modules.carFlipperUpgrades.rows.map((row: any, i: number) => {
              const Icon = upgradeRowIcons[i] || Wrench;
              return (
                <div
                  key={i}
                  className="p-4 bg-white/5 border border-border rounded-xl"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
                    <h3 className="font-bold">{row.category}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{row.role}</p>
                  <p className="text-sm mb-2">
                    <span className="font-semibold">
                      {t.modules.carFlipperUpgrades.colBestFor}:{" "}
                    </span>
                    <span className="text-muted-foreground">
                      {row.bestUsedFor}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mb-2">
                    {row.impact}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]">
                    <Check className="w-3 h-3 text-[hsl(var(--nav-theme-light))]" />
                    {row.recommendedPriority}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Module 7: Workshop Expansion and Profit Guide */}
      <section id="workshop" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            Icon={Warehouse}
            title={t.modules.carFlipperWorkshop.title}
            subtitle={t.modules.carFlipperWorkshop.subtitle}
            intro={t.modules.carFlipperWorkshop.intro}
            linkData={moduleLinkMap["carFlipperWorkshop"]}
            locale={locale}
          />

          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.modules.carFlipperWorkshop.cards.map((card: any, i: number) => {
              const Icon = workshopCardIcons[i] || Star;
              return (
                <div
                  key={i}
                  className="p-5 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--nav-theme)/0.1)] mb-3">
                    <Icon className="h-5 w-5 text-[hsl(var(--nav-theme-light))]" />
                  </div>
                  <h3 className="font-bold mb-1.5">{card.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {card.description}
                  </p>
                  <div className="space-y-2 pt-2 border-t border-border/60">
                    <div className="flex items-start gap-2">
                      <Target className="w-3.5 h-3.5 text-[hsl(var(--nav-theme-light))] mt-0.5 flex-shrink-0" />
                      <p className="text-xs">
                        <span className="font-semibold">
                          {t.modules.carFlipperWorkshop.goalLabel}:{" "}
                        </span>
                        <span className="text-muted-foreground">{card.goal}</span>
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-[hsl(var(--nav-theme-light))] mt-0.5 flex-shrink-0" />
                      <p className="text-xs">
                        <span className="font-semibold">
                          {t.modules.carFlipperWorkshop.decisionLabel}:{" "}
                        </span>
                        <span className="text-muted-foreground">
                          {card.bestDecision}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Module 8: Racing and World Exploration Guide */}
      <section
        id="racing"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            Icon={Flag}
            title={t.modules.carFlipperRacing.title}
            subtitle={t.modules.carFlipperRacing.subtitle}
            intro={t.modules.carFlipperRacing.intro}
            linkData={moduleLinkMap["carFlipperRacing"]}
            locale={locale}
          />

          <div className="scroll-reveal space-y-3 max-w-3xl mx-auto">
            {t.modules.carFlipperRacing.items.map((item: any, i: number) => (
              <AccordionItem
                key={i}
                question={item.question}
                answer={item.answer}
                isOpen={racingExpanded === i}
                onToggle={() =>
                  setRacingExpanded(racingExpanded === i ? null : i)
                }
                Icon={Flag}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <FAQSection
          title={t.faq.title}
          titleHighlight={t.faq.titleHighlight}
          subtitle={t.faq.subtitle}
          questions={t.faq.questions}
        />
      </Suspense>

      {/* CTA Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <CTASection
          title={t.cta.title}
          description={t.cta.description}
          joinCommunity={t.cta.joinCommunity}
          joinGame={t.cta.joinGame}
        />
      </Suspense>

      {/* Ad Banner 3 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Footer */}
      <footer className="bg-white/[0.02] border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-[hsl(var(--nav-theme-light))]">
                {t.footer.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t.footer.description}
              </p>
            </div>

            {/* Community - External Links Only */}
            <div>
              <h4 className="font-semibold mb-4">{t.footer.community}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://www.roblox.com/games/136533956395153/Car-Flipper"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.robloxGame}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.roblox.com/communities/11553831/A-B-Group"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.robloxCommunity}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.youtube.com/watch?v=YK8IBprhp50"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.youtube}
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal - Internal Routes Only */}
            <div>
              <h4 className="font-semibold mb-4">{t.footer.legal}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.about}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.privacy}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-service"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.terms}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/copyright"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.copyrightNotice}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Copyright */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {t.footer.copyright}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.footer.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
