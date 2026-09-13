import { NextResponse } from "next/server";
import {
  getSiteConfig,
  updateSiteConfig,
  getHomepageData,
  updateHomepageData,
  getFooterData,
  getNavigation,
} from "@/lib/cms/client";

export async function GET() {
  const [siteConfig, homepage, footer, navigation] = await Promise.all([
    getSiteConfig(),
    getHomepageData(),
    getFooterData(),
    getNavigation(),
  ]);

  return NextResponse.json({
    siteConfig,
    homepage,
    footer,
    navigation,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.siteConfig) {
      await updateSiteConfig(body.siteConfig);
    }
    if (body.homepage) {
      await updateHomepageData(body.homepage);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update site configuration" }, { status: 500 });
  }
}
