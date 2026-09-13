import mongoose, { Schema, Document, Model } from "mongoose";

export interface IArticle extends Document {
  slug: string;
  title: string;
  category: string;
  date: string;
  author: string;
  authorRole?: string;
  img: string;
  intro: string;
  quickSummary?: string;
  keyBenefits?: string[];
  sections: { heading: string; text: string }[];
  dataTable?: { headers: string[]; rows: string[][] };
  safeSteps?: { step: number; title: string; desc: string }[];
  callout?: string;
  relatedSlugs: string[];
  status: "published" | "draft";
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  createdAt: Date;
}

const ArticleSchema: Schema = new Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  date: { type: String, default: "" },
  author: { type: String, default: "CalmTouch Editorial Team" },
  authorRole: { type: String, default: "" },
  img: { type: String, default: "/assets/images/article1.png" },
  intro: { type: String, default: "" },
  quickSummary: { type: String, default: "" },
  keyBenefits: [{ type: String }],
  sections: [
    {
      heading: { type: String },
      text: { type: String },
    },
  ],
  dataTable: {
    headers: [{ type: String }],
    rows: [[{ type: String }]],
  },
  safeSteps: [
    {
      step: { type: Number },
      title: { type: String },
      desc: { type: String },
    },
  ],
  callout: { type: String, default: "" },
  relatedSlugs: [{ type: String }],
  status: { type: String, enum: ["published", "draft"], default: "published" },
  metaTitle: { type: String, default: "" },
  metaDescription: { type: String, default: "" },
  keywords: [{ type: String }],
  canonicalUrl: { type: String, default: "" },
  ogImage: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

export const ArticleModel: Model<IArticle> =
  mongoose.models.Article || mongoose.model<IArticle>("Article", ArticleSchema);
