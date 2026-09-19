import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  username: string;
  /** scrypt hash (`scrypt$salt$hash`). Legacy accounts may still hold plaintext until their next login. */
  password: string;
  email?: string;
  displayName?: string;
  role: string;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, default: "" },
  displayName: { type: String, default: "" },
  role: { type: String, default: "administrator" },
  createdAt: { type: Date, default: Date.now },
});

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
