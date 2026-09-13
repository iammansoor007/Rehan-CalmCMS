import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISiteConfig extends Document {
  brandName: string;
  tagline: string;
  logoUrl?: string;
  metaDescription: string;
  contactEmail: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
}

const SiteConfigSchema: Schema = new Schema({
  brandName: { type: String, default: "CalmTouch" },
  tagline: { type: String, default: "Massage & Wellness Blog" },
  logoUrl: { type: String, default: "" },
  metaDescription: { type: String, default: "" },
  contactEmail: { type: String, default: "support@calmtouch.com" },
  socialLinks: {
    facebook: { type: String, default: "" },
    twitter: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    instagram: { type: String, default: "" },
  },
});

export const SiteConfigModel: Model<ISiteConfig> =
  mongoose.models.SiteConfig || mongoose.model<ISiteConfig>("SiteConfig", SiteConfigSchema);
