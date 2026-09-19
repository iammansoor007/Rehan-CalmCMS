import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPage extends Document {
  slug: string;
  title: string;
  content: string;
  status: "published" | "draft";
  img?: string;
  imgAlt?: string;
  seo?: Record<string, unknown>;
  metaTitle?: string;
  metaDescription?: string;
  author?: string;
  updatedAt: Date;
  createdAt: Date;
}

const PageSchema: Schema = new Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, default: "" },
  status: { type: String, enum: ["published", "draft"], default: "published" },
  img: { type: String, default: "" },
  imgAlt: { type: String, default: "" },
  seo: { type: Schema.Types.Mixed, default: {} },
  metaTitle: { type: String, default: "" },
  metaDescription: { type: String, default: "" },
  author: { type: String, default: "" },
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

export const PageModel: Model<IPage> =
  mongoose.models.Page || mongoose.model<IPage>("Page", PageSchema);
