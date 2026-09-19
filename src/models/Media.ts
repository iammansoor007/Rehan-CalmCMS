import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMedia extends Document {
  filename: string;
  url: string;
  size: number;
  mimetype: string;
  alt?: string;
  title?: string;
  caption?: string;
  description?: string;
  createdAt: Date;
}

const MediaSchema: Schema = new Schema({
  filename: { type: String, required: true },
  url: { type: String, required: true },
  size: { type: Number, default: 0 },
  mimetype: { type: String, default: "image/png" },
  alt: { type: String, default: "" },
  title: { type: String, default: "" },
  caption: { type: String, default: "" },
  description: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

export const MediaModel: Model<IMedia> =
  mongoose.models.Media || mongoose.model<IMedia>("Media", MediaSchema);
