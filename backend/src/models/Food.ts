import { Schema, model, type HydratedDocument, type Types } from "mongoose";

export interface Food {
  name: string;
  description: string;
  price: number;
  image: string;
  category: Types.ObjectId;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type FoodDocument = HydratedDocument<Food>;

const foodSchema = new Schema<Food>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, trim: true, default: "" },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    isAvailable: { type: Boolean, default: true, required: true }
  },
  { timestamps: true }
);

foodSchema.index({ name: "text", description: "text" });

export const FoodModel = model<Food>("Food", foodSchema);
