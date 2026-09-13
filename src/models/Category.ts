import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategory extends Document {
  slug: string;
  name: string;
  description: string;
  createdAt: Date;
}

const CategorySchema: Schema = new Schema({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

export const CategoryModel: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);
