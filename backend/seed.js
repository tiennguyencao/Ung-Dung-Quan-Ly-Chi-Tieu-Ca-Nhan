import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './src/config/db.js';
import Category from './src/modules/categories/category.model.js';

// Exactly the 6 categories named in README §2.3 and database-design-baseline-v1.0.md's
// Sample Seed Data section — required in every environment, not just for local dev,
// since FR-13 depends on default categories existing.
const defaultCategories = [
  { userId: null, isDefault: true, name: 'Ăn uống', icon: 'utensils', color: '#F59E0B' },
  { userId: null, isDefault: true, name: 'Di chuyển', icon: 'car', color: '#3B82F6' },
  { userId: null, isDefault: true, name: 'Hóa đơn', icon: 'receipt', color: '#EF4444' },
  { userId: null, isDefault: true, name: 'Giải trí', icon: 'film', color: '#8B5CF6' },
  { userId: null, isDefault: true, name: 'Lương', icon: 'briefcase', color: '#10B981' },
  { userId: null, isDefault: true, name: 'Thưởng', icon: 'gift', color: '#14B8A6' },
];

async function seed() {
  await connectDB();

  // upsert on {name, isDefault:true} makes this safe to re-run — it will never
  // create duplicates, matching the unique index on {userId, name}.
  for (const category of defaultCategories) {
    await Category.updateOne(
      { name: category.name, isDefault: true },
      { $setOnInsert: category },
      { upsert: true }
    );
  }

  console.log(`Seeded ${defaultCategories.length} default categories.`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
