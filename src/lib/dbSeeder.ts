import { connectToDatabase } from "./mongodb";
import { User } from "@/models/User";
import { ArticleModel } from "@/models/Article";
import { CategoryModel } from "@/models/Category";
import { SiteConfigModel } from "@/models/SiteConfig";
import { articlesData } from "./cms/data/articles";
import { categoriesData } from "./cms/data/categories";
import { siteConfig } from "./cms/data/siteConfig";
import { hashPassword } from "./password";
import { BOOTSTRAP_ADMIN } from "./bootstrapAdmin";

let isSeeded = false;

export async function ensureDatabaseSeeded() {
  if (isSeeded) return;

  const db = await connectToDatabase();
  if (!db) return; // MONGODB_URI not provided yet

  try {
    // 1. Ensure an admin exists (created once, with a hashed password). Existing
    // accounts are left alone so passwords/roles changed in the admin panel stick.
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.create({
        username: BOOTSTRAP_ADMIN.username,
        password: hashPassword(BOOTSTRAP_ADMIN.password),
        email: BOOTSTRAP_ADMIN.email,
        displayName: BOOTSTRAP_ADMIN.displayName,
        role: "administrator",
      });
      console.log(` Admin user '${BOOTSTRAP_ADMIN.username}' created.`);
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
