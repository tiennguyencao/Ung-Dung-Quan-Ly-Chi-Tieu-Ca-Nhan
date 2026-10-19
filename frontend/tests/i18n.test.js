import test from 'node:test';
import assert from 'node:assert/strict';
import { translateText, translateCategoryName } from '../src/utils/translations.js';

test('English is the fallback language and preserves interface copy', () => {
  assert.equal(translateText('Add transaction', 'en'), 'Add transaction');
  assert.equal(translateText('Unmapped phrase', 'vi'), 'Unmapped phrase');
});

test('Vietnamese translations cover primary navigation and core actions', () => {
  assert.equal(translateText('Dashboard', 'vi'), 'Tổng quan');
  assert.equal(translateText('Add transaction', 'vi'), 'Thêm giao dịch');
  assert.equal(translateText('Delete budget?', 'vi'), 'Xóa ngân sách?');
});

test('default categories are localized for English display without changing Vietnamese stored names', () => {
  assert.equal(translateCategoryName('Ăn uống', 'en'), 'Food & Dining');
  assert.equal(translateCategoryName('Ăn uống', 'vi'), 'Ăn uống');
  assert.equal(translateCategoryName('My custom category', 'en'), 'My custom category');
});


test('known API errors and dynamic category errors are localized without losing user data', () => {
  assert.equal(translateText('Invalid email or password.', 'vi'), 'Email hoặc mật khẩu không hợp lệ.');
  assert.equal(translateText('Default categories can\'t be deleted.', 'vi'), 'Không thể xóa danh mục mặc định.');
  assert.equal(translateText('A category named "Đồ dùng học tập" already exists.', 'vi'), 'Danh mục tên "Đồ dùng học tập" đã tồn tại.');
  assert.match(translateText('Can\'t delete "Ăn uống" — 2 transactions still use it. Reassign or delete them first.', 'vi'), /2 giao dịch/);
});

test('language selection labels and session actions have Vietnamese copy', () => {
  assert.equal(translateText('Choose language', 'vi'), 'Chọn ngôn ngữ');
  assert.equal(translateText('Log out', 'vi'), 'Đăng xuất');
  assert.equal(translateText('Save changes', 'vi'), 'Lưu thay đổi');
});
