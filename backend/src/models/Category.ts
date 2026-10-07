import { Schema, model, type HydratedDocument } from "mongoose";

export interface Category {
  name: string;
  slug: string;
  description: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CategoryDocument = HydratedDocument<Category>;

const categorySchema = new Schema<Category>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true, default: "" },
    image: { type: String, trim: true, default: "" }
  },
  { timestamps: true }
);

export const CategoryModel = model<Category>("Category", categorySchema);
