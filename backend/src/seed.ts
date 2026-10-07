import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDatabase } from "./config/db";
import { env } from "./config/env";
import { CategoryModel } from "./models/Category";
import { FoodModel } from "./models/Food";
import { UserModel } from "./models/User";

const categories = [
  { name: "Burgers", slug: "burgers", description: "Freshly prepared burgers" },
  { name: "Pizza", slug: "pizza", description: "Oven-baked pizzas" },
  { name: "Sides", slug: "sides", description: "Sides and snacks" },
  { name: "Drinks", slug: "drinks", description: "Cold beverages" }
];

async function seed(): Promise<void> {
  await connectDatabase();
  for (const category of categories) {
    await CategoryModel.updateOne({ slug: category.slug }, { $setOnInsert: category }, { upsert: true });
  }
  const categoryDocs = await CategoryModel.find({ slug: { $in: categories.map((category) => category.slug) } });
  const categoryBySlug = new Map(categoryDocs.map((category) => [category.slug, category._id]));
  const samples = [
    { name: "Classic Cheeseburger", description: "Grilled beef, cheddar, lettuce and house sauce.", price: 199, category: "burgers", image: "" },
    { name: "Crispy Chicken Burger", description: "Crispy chicken, pickles and creamy mayonnaise.", price: 219, category: "burgers", image: "" },
    { name: "Margherita Pizza", description: "Tomato, mozzarella and fresh basil.", price: 249, category: "pizza", image: "" },
    { name: "Pepperoni Pizza", description: "Mozzarella topped with pepperoni.", price: 250, category: "pizza", image: "" },
    { name: "French Fries", description: "Golden, lightly salted fries.", price: 150, category: "sides", image: "" },
    { name: "Cola", description: "Chilled sparkling cola.", price: 150, category: "drinks", image: "" }
  ];
  for (const sample of samples) {
    const category = categoryBySlug.get(sample.category);
    if (category) {
      await FoodModel.updateOne(
        { name: sample.name },
        {
          $set: { price: sample.price },
          $setOnInsert: {
            name: sample.name,
            description: sample.description,
            category,
            image: sample.image,
            isAvailable: true
          }
        },
        { upsert: true }
      );
    }
  }
  const email = env.SEED_ADMIN_EMAIL.toLowerCase();
  const password = await bcrypt.hash(env.SEED_ADMIN_PASSWORD, 12);
  await UserModel.updateOne(
    { email },
    { $setOnInsert: { name: "Administrator", email, password, role: "admin" } },
    { upsert: true }
  );
  console.info(`Seeded catalog and administrator ${email}`);
}

seed()
  .catch((error: unknown) => {
    console.error("Seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
