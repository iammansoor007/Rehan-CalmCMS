import mongoose, { Schema, Document, Model } from "mongoose";

export interface IContent extends Document {
  key: string;
  data: Record<string, unknown>;
  updatedAt: Date;
}

const ContentSchema: Schema = new Schema({
  key: { type: String, required: true, unique: true },
  data: { type: Schema.Types.Mixed, default: {} },
  updatedAt: { type: Date, default: Date.now },
});

export const ContentModel: Model<IContent> =
  mongoose.models.Content || mongoose.model<IContent>("Content", ContentSchema);
