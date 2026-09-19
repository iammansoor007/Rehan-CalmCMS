import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { getSiteConfig, getNavigation, getArticles, getFooterData } from "@/lib/cms/client";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ToastProvider } from "@/components/layout/Toast";
import { SiteShell } from "@/components/layout/SiteShell";
import { getExcerpt } from "@/lib/excerpt";
import { getSeoContext, siteJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { fillTemplate } from "@/lib/seoShared";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const { settings, site, baseUrl } = await getSeoContext();
  const v = settings.verification;
  const other: Record<string, string> = {};
  if (v.bing) other["msvalidate.01"] = v.bing;
  if (v.pinterest) other["p:domain_verify"] = v.pinterest;

  return {
    metadataBase: new URL(baseUrl),
    // Every page supplies its own full title; this is the fallback for pages that do not.
    title: {
      default: fillTemplate(settings.titleTemplates.home, {
        sitename: site.brandName,
        tagline: site.tagline,
        sep: settings.titleSeparator,
      }),
      template: "%s",
    },
    description: settings.defaultDescription || site.metaDescription,
    icons: {
      icon: "/favicon.ico",
    },
    robots: settings.indexing.siteVisible ? undefined : { index: false, follow: false },
    verification: {
      google: v.google || undefined,
      yandex: v.yandex || undefined,
      other: Object.keys(other).length ? other : undefined,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteConfig = await getSiteConfig();
  const navigation = await getNavigation();
  const articles = await getArticles();
  const footerData = await getFooterData();
  const seoCtx = await getSeoContext();
  const ga4 = /^G-[A-Z0-9]{4,}$/i.test(seoCtx.settings.analytics.ga4Id) ? seoCtx.settings.analytics.ga4Id : "";

  // The header search only needs titles and excerpts — don't ship every post body to the browser.
  const searchArticles = articles.map((a) => ({
    ...a,
    intro: getExcerpt(a),
    content: "",
    sections: [],
    quickSummary: "",
    keyBenefits: [],
    dataTable: undefined,
    safeSteps: undefined,
  }));

  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="flex flex-col min-h-screen">
        <JsonLd data={[siteJsonLd(seoCtx)]} />
        {ga4 && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga4}`} strategy="afterInteractive" />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag("js", new Date());gtag("config", "${ga4}");`}
            </Script>
          </>
        )}
        <ToastProvider>
          <SiteShell
            header={<Header siteConfig={siteConfig} navigation={navigation} articles={searchArticles} />}
            footer={<Footer siteConfig={siteConfig} footerContent={footerData} />}
          >
            {children}
          </SiteShell>
        </ToastProvider>
      </body>
    </html>
  );
}
