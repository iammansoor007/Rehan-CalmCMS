import { NextResponse } from "next/server";
import {
  getSiteConfig,
  updateSiteConfig,
  getHomepageData,
  getFooterData,
  getNavigation,
} from "@/lib/cms/client";
import { authorize } from "@/lib/auth";
import { errorResponse } from "@/lib/cms/errors";

export async function GET() {
  const auth = await authorize();
  if (auth.error) return auth.error;

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
  const auth = await authorize("manage_settings");
  if (auth.error) return auth.error;

  try {
    const body = await req.json();

    if (body.siteConfig) {
      await updateSiteConfig(body.siteConfig);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error, "Failed to update site configuration");
  }
}
