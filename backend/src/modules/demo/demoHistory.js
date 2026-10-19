// Synthetic, deterministic transaction history used only for local demonstrations.
// No real financial activity is represented by these values.

function dateKey(year, monthIndex, day) {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function stableNumber(seed) {
  // Small deterministic integer hash: output is stable across machines/reruns.
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function amountFor(seed, min, max, step = 5000) {
  const slots = Math.floor((max - min) / step) + 1;
  return min + (stableNumber(seed) % slots) * step;
}

function moneyNote(note, monthKey) {
  const [year, month] = monthKey.split('-');
  return `${note} tháng ${month}/${year}`;
}

function plusYears(date, years) {
  // Preserve a calendar date when possible; clamp leap-day edge cases.
  const result = new Date(date.getFullYear() + years, date.getMonth(), 1, 12);
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(date.getDate(), lastDay));
  return result;
}

export function localDateKey(date) {
  return dateKey(date.getFullYear(), date.getMonth(), date.getDate());
}

function monthKey(year, monthIndex) {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
}

/**
 * Generate an approximately one-year synthetic history up to the supplied local
 * calendar day. Candidate transaction dates are stored as UTC noon so their
 * YYYY-MM-DD label remains stable in common time zones.
 */
export function generateDemoTransactions(today = new Date()) {
  const todayKey = localDateKey(today);
  const startDate = plusYears(today, -1);
  const startKey = localDateKey(startDate);
  const entries = [];

  const candidatesForMonth = (year, monthIndex) => {
    const key = monthKey(year, monthIndex);
    const isYearEnd = monthIndex === 11;
    const salary = (year < 2026 || (year === 2026 && monthIndex < 2)) ? 14_500_000 : 15_000_000;
    const candidates = [
      {
        slot: 'salary', day: 5, categoryName: 'Lương', type: 'income', amount: salary,
        note: moneyNote('Lương công việc chính', key),
      },
      {
        slot: 'utilities', day: 3, categoryName: 'Hóa đơn', type: 'expense',
        amount: amountFor(`${key}/utilities`, 750_000, 1_250_000, 10_000),
        note: moneyNote('Tiền điện, nước', key),
      },
      {
        slot: 'phone-internet', day: 17, categoryName: 'Hóa đơn', type: 'expense',
        amount: amountFor(`${key}/phone-internet`, 280_000, 520_000, 10_000),
        note: moneyNote('Internet và điện thoại', key),
      },
      {
        slot: 'food-1', day: 7, categoryName: 'Ăn uống', type: 'expense',
        amount: amountFor(`${key}/food-1`, 75_000, 180_000, 5_000),
        note: moneyNote('Ăn trưa và cà phê', key),
      },
      {
        slot: 'food-2', day: 12, categoryName: 'Ăn uống', type: 'expense',
        amount: amountFor(`${key}/food-2`, 95_000, 240_000, 5_000),
        note: moneyNote('Ăn uống cuối tuần', key),
      },
      {
        slot: 'food-3', day: 19, categoryName: 'Ăn uống', type: 'expense',
        amount: amountFor(`${key}/food-3`, 85_000, 260_000, 5_000),
        note: moneyNote('Mua thực phẩm', key),
      },
      {
        slot: 'food-4', day: 26, categoryName: 'Ăn uống', type: 'expense',
        amount: amountFor(`${key}/food-4`, 110_000, 280_000, 5_000),
        note: moneyNote('Bữa ăn với bạn bè', key),
      },
      {
        slot: 'transport-1', day: 10, categoryName: 'Di chuyển', type: 'expense',
        amount: amountFor(`${key}/transport-1`, 40_000, 160_000, 5_000),
        note: moneyNote('Đi lại hằng ngày', key),
      },
      {
        slot: 'transport-2', day: 24, categoryName: 'Di chuyển', type: 'expense',
        amount: amountFor(`${key}/transport-2`, 60_000, 230_000, 5_000),
        note: moneyNote('Xăng xe và di chuyển', key),
      },
      {
        slot: 'entertainment', day: 14, categoryName: 'Giải trí', type: 'expense',
        amount: amountFor(`${key}/entertainment`, 120_000, isYearEnd ? 750_000 : 520_000, 10_000),
        note: moneyNote(isYearEnd ? 'Xem phim và hoạt động cuối năm' : 'Xem phim và thư giãn', key),
      },
    ];

    // Periodic bonus entries provide some realistic variation in income.
    if ([0, 3, 6, 9].includes(monthIndex)) {
      candidates.push({
        slot: 'bonus', day: 15, categoryName: 'Thưởng', type: 'income',
        amount: amountFor(`${key}/bonus`, 1_000_000, 2_500_000, 100_000),
        note: moneyNote('Thưởng hiệu suất', key),
      });
    }
    return candidates;
  };

  const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1, 12);
  const finalMonth = new Date(today.getFullYear(), today.getMonth(), 1, 12);
  while (cursor <= finalMonth) {
    const year = cursor.getFullYear();
    const monthIndex = cursor.getMonth();
    const key = monthKey(year, monthIndex);
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    for (const item of candidatesForMonth(year, monthIndex)) {
      if (item.day > daysInMonth) continue;
      const dayKey = dateKey(year, monthIndex, item.day);
      if (dayKey < startKey || dayKey > todayKey) continue;
      entries.push({
        ...item,
        month: key,
        dateKey: dayKey,
        date: new Date(`${dayKey}T12:00:00.000Z`),
      });
    }
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return entries.sort((a, b) => a.dateKey.localeCompare(b.dateKey) || a.slot.localeCompare(b.slot));
}

export function monthsInDemoRange(today = new Date()) {
  const startDate = plusYears(today, -1);
  const months = [];
  const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1, 12);
  const finalMonth = new Date(today.getFullYear(), today.getMonth(), 1, 12);
  while (cursor <= finalMonth) {
    months.push(monthKey(cursor.getFullYear(), cursor.getMonth()));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months;
}
