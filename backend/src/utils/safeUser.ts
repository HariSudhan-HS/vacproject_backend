import type { UserDocument } from "../models/User";

export function safeUser(user: UserDocument): {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  createdAt: Date;
} {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  };
}
