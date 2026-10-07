import { Schema, model, type HydratedDocument, type Types } from "mongoose";

export type OrderStatus = "pending" | "confirmed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled";

export interface OrderItem {
  food: Types.ObjectId;
  name: string;
  image: string;
  unitPrice: number;
  quantity: number;
}

export interface Order {
  user: Types.ObjectId;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  deliveryAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderDocument = HydratedDocument<Order>;

const orderSchema = new Schema<Order>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: [{
      food: { type: Schema.Types.ObjectId, ref: "Food", required: true },
      name: { type: String, required: true },
      image: { type: String, default: "" },
      unitPrice: { type: Number, required: true, min: 0 },
      quantity: { type: Number, required: true, min: 1 }
    }],
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"],
      default: "pending",
      required: true
    },
    deliveryAddress: { type: String, required: true, trim: true, maxlength: 500 }
  },
  { timestamps: true }
);

export const OrderModel = model<Order>("Order", orderSchema);
