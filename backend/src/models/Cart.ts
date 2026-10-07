import { Schema, model, type HydratedDocument, type Types } from "mongoose";

export interface CartItem {
  food: Types.ObjectId;
  quantity: number;
}

export interface Cart {
  user: Types.ObjectId;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}

export type CartDocument = HydratedDocument<Cart>;

const cartSchema = new Schema<Cart>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    items: [{
      food: { type: Schema.Types.ObjectId, ref: "Food", required: true },
      quantity: { type: Number, required: true, min: 1, max: 99 }
    }]
  },
  { timestamps: true }
);

export const CartModel = model<Cart>("Cart", cartSchema);
