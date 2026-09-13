import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { getSiteConfig, getNavigation, getArticles, getFooterData } from "@/lib/cms/client";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ToastProvider } from "@/components/layout/Toast";

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
  const siteConfig = await getSiteConfig();
  return {
    metadataBase: new URL("https://calmtouch.com"),
    title: {
      default: `${siteConfig.brandName} — ${siteConfig.tagline}`,
      template: `%s | ${siteConfig.brandName}`,
    },
    description: siteConfig.metaDescription,
    icons: {
      icon: "/favicon.ico",
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

  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="flex flex-col min-h-screen">
        <ToastProvider>
          <Header siteConfig={siteConfig} navigation={navigation} articles={articles} />
          <main className="flex-grow">{children}</main>
          <Footer siteConfig={siteConfig} footerContent={footerData} />
        </ToastProvider>
      </body>
    </html>
  );
}
