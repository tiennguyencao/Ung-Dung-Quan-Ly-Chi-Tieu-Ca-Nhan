import 'dotenv/config';
import crypto from 'node:crypto';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import mongoose from 'mongoose';
import { connectDB } from './src/config/db.js';
import User from './src/modules/auth/user.model.js';
import Category from './src/modules/categories/category.model.js';
import Transaction from './src/modules/transactions/transaction.model.js';
import Budget from './src/modules/budgets/budget.model.js';
import { generateDemoTransactions, monthsInDemoRange, localDateKey } from './src/modules/demo/demoHistory.js';

const DEFAULT_CATEGORIES = ['Ăn uống', 'Di chuyển', 'Hóa đơn', 'Giải trí', 'Lương', 'Thưởng'];
const BUDGET_LIMITS = [
  { categoryName: null, limitAmount: 8_000_000 },
  { categoryName: 'Ăn uống', limitAmount: 1_500_000 },
  { categoryName: 'Di chuyển', limitAmount: 1_000_000 },
  { categoryName: 'Hóa đơn', limitAmount: 2_000_000 },
  { categoryName: 'Giải trí', limitAmount: 1_200_000 },
];

function stableObjectId(namespace, userId, stableKey) {
  const hex = crypto.createHash('sha256').update(`${namespace}:${userId}:${stableKey}`).digest('hex').slice(0, 24);
  return new mongoose.Types.ObjectId(hex);
}

function monthOf(value) {
  return String(value).slice(0, 7);
}

async function askForEmail(rl) {
  const argIndex = process.argv.indexOf('--email');
  if (argIndex >= 0 && process.argv[argIndex + 1]) return process.argv[argIndex + 1].trim().toLowerCase();
  return (await rl.question('Email tài khoản trong app để thêm dữ liệu demo: ')).trim().toLowerCase();
}

async function seedDemoHistory() {
  const rl = readline.createInterface({ input, output });
  try {
    await connectDB();
    const email = await askForEmail(rl);
    if (!email) throw new Error('Email không được để trống.');

    const user = await User.findOne({ email });
    if (!user) {
      throw new Error(`Không tìm thấy tài khoản ${email}. Kiểm tra email bạn dùng để đăng nhập rồi chạy lại.`);
    }

    const categories = await Category.find({ isDefault: true, name: { $in: DEFAULT_CATEGORIES } });
    const categoryByName = new Map(categories.map((category) => [category.name, category]));
    const missing = DEFAULT_CATEGORIES.filter((name) => !categoryByName.has(name));
    if (missing.length) {
      throw new Error(`Thiếu danh mục mặc định: ${missing.join(', ')}. Hãy chạy npm run seed trước.`);
    }

    const today = new Date();
    const todayKey = localDateKey(today);
    const entries = generateDemoTransactions(today);
    const months = monthsInDemoRange(today);
    const categoryIds = Object.fromEntries([...categoryByName.entries()].map(([name, category]) => [name, category._id]));

    // If the user's real/demo account already has salary or bonus in a given month,
    // keep it as-is rather than injecting a second income transaction in that month.
    const firstMonth = `${months[0]}-01T00:00:00.000Z`;
    const afterLastMonth = (() => {
      const [y, m] = months[months.length - 1].split('-').map(Number);
      return new Date(Date.UTC(y, m, 1));
    })();
    const existingIncome = await Transaction.find({
      userId: user._id,
      type: 'income',
      categoryId: { $in: [categoryIds['Lương'], categoryIds['Thưởng']] },
      date: { $gte: new Date(firstMonth), $lt: afterLastMonth },
    }).select('type categoryId date');
    const incomeMonths = new Set(existingIncome.map((transaction) => `${transaction.type}:${transaction.categoryId}:${monthOf(transaction.date.toISOString())}`));

    const transactionOps = [];
    let incomeSkipped = 0;
    for (const entry of entries) {
      const categoryId = categoryIds[entry.categoryName];
      if (entry.type === 'income') {
        const key = `${entry.type}:${categoryId}:${entry.month}`;
        if (incomeMonths.has(key)) {
          incomeSkipped += 1;
          continue;
        }
      }
      const id = stableObjectId('pem-demo-history-v1', user._id, `${entry.dateKey}:${entry.slot}:${entry.type}:${entry.categoryName}`);
      transactionOps.push({
        updateOne: {
          filter: { _id: id, userId: user._id },
          update: {
            $setOnInsert: {
              _id: id,
              userId: user._id,
              categoryId,
              type: entry.type,
              amount: entry.amount,
              date: entry.date,
              note: entry.note,
            },
          },
          upsert: true,
        },
      });
    }

    // Determine which budget slots are missing before asking the user to confirm.
    const budgetOps = [];
    let budgetSkipped = 0;
    for (const month of months) {
      for (const template of BUDGET_LIMITS) {
        const categoryId = template.categoryName ? categoryIds[template.categoryName] : null;
        const existing = await Budget.findOne({ userId: user._id, month, categoryId });
        if (existing) {
          budgetSkipped += 1;
          continue;
        }
        const id = stableObjectId('pem-demo-budget-v1', user._id, `${month}:${template.categoryName || 'overall'}`);
        budgetOps.push({
          updateOne: {
            filter: { _id: id, userId: user._id },
            update: {
              $setOnInsert: {
                _id: id,
                userId: user._id,
                month,
                categoryId,
                limitAmount: template.limitAmount,
              },
            },
            upsert: true,
          },
        });
      }
    }

    console.log('\nKẾ HOẠCH THÊM DỮ LIỆU DEMO (không phải dữ liệu tài chính thật)');
    console.log(`Tài khoản: ${user.name} <${user.email}>`);
    console.log(`Khoảng ngày: ${months[0]} đến ${todayKey} (1 năm tính ngược từ hôm nay)`);
    console.log(`Giao dịch dự kiến kiểm tra/thêm: ${transactionOps.length}`);
    console.log(`Ngân sách dự kiến kiểm tra/thêm: ${budgetOps.length}`);
    console.log(`Khoản lương/thưởng trong tháng đã có, sẽ được giữ nguyên: ${incomeSkipped}`);
    console.log(`Ngân sách đã tồn tại, sẽ được giữ nguyên: ${budgetSkipped}`);
    console.log('Không xóa hoặc ghi đè giao dịch/ngân sách hiện có. Có thể chạy lại an toàn.');
    const answer = (await rl.question('\nNếu bạn muốn tiếp tục, hãy gõ ADD rồi nhấn Enter: ')).trim();
    if (answer !== 'ADD') {
      console.log('Đã hủy. Không thêm dữ liệu nào.');
      return;
    }

    const transactionResult = transactionOps.length
      ? await Transaction.bulkWrite(transactionOps, { ordered: false })
      : { upsertedCount: 0 };
    const budgetResult = budgetOps.length
      ? await Budget.bulkWrite(budgetOps, { ordered: false })
      : { upsertedCount: 0 };

    console.log('\nHoàn tất thêm dữ liệu demo.');
    console.log(`Giao dịch mới được thêm: ${transactionResult.upsertedCount || 0}`);
    console.log(`Ngân sách mới được thêm: ${budgetResult.upsertedCount || 0}`);
    console.log('Các giao dịch và ngân sách có sẵn được giữ nguyên.');
  } finally {
    rl.close();
    await mongoose.disconnect();
  }
}

seedDemoHistory().catch((error) => {
  console.error('\nKhông thể thêm dữ liệu demo:', error.message);
  process.exitCode = 1;
}).finally(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});
