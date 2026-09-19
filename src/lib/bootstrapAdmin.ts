/** The first administrator account, created automatically when no users exist yet. */
export const BOOTSTRAP_ADMIN = {
  username: process.env.ADMIN_USERNAME || "rehanblogsite",
  password: process.env.ADMIN_PASSWORD || "rehanblogsite@2026adsense",
  email: "support@calmtouch.com",
  displayName: "Site Administrator",
};
