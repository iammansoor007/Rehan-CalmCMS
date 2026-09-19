import { NextResponse } from "next/server";
import { authorize } from "@/lib/auth";
import { getSeoContext } from "@/lib/seo";

/** Read-only site-wide SEO info for the per-page SEO panels (available to every logged-in user). */
export async function GET() {
  const auth = await authorize();
  if (auth.error) return auth.error;

  const { settings, site, baseUrl } = await getSeoContext();
  return NextResponse.json({
    baseUrl,
    siteName: site.brandName,
    tagline: site.tagline,
    siteDescription: site.metaDescription,
    settings,
  });
}
