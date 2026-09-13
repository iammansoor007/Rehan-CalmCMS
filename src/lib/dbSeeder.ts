import { connectToDatabase } from "./mongodb";
import { User } from "@/models/User";
import { ArticleModel } from "@/models/Article";
import { CategoryModel } from "@/models/Category";
import { SiteConfigModel } from "@/models/SiteConfig";
import { articlesData } from "./cms/data/articles";
import { categoriesData } from "./cms/data/categories";
import { siteConfig } from "./cms/data/siteConfig";

let isSeeded = false;

export async function ensureDatabaseSeeded() {
  if (isSeeded) return;

  const db = await connectToDatabase();
  if (!db) return; // MONGODB_URI not provided yet

  try {
    // 1. Ensure Admin User
    const adminUser = await User.findOne({ username: "rehanblogsite" });
    if (!adminUser) {
      await User.create({
        username: "rehanblogsite",
        password: "rehanblogsite@2026adsense",
        role: "admin",
      });
      console.log(" Admin user 'rehanblogsite' created.");
    }

    // 2. Ensure Categories
    const catCount = await CategoryModel.countDocuments();
    if (catCount === 0) {
      await CategoryModel.insertMany(categoriesData);
      console.log(` Initialized ${categoriesData.length} categories.`);
    }

    // 3. Ensure Articles
    const artCount = await ArticleModel.countDocuments();
    if (artCount === 0) {
      await ArticleModel.insertMany(
        articlesData.map((art) => ({
          ...art,
          status: "published",
        }))
      );
      console.log(` Initialized ${articlesData.length} articles.`);
    }

    // 4. Ensure SiteConfig
    const configCount = await SiteConfigModel.countDocuments();
    if (configCount === 0) {
      await SiteConfigModel.create(siteConfig);
      console.log(" Initialized SiteConfig in MongoDB.");
    }

    isSeeded = true;
  } catch (err) {
    console.error("Database seeding error:", err);
  }
}
