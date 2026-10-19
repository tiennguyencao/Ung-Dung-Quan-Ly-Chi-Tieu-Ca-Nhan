import test from 'node:test';
import assert from 'node:assert/strict';
import { buildNoteSearchCondition } from '../src/modules/transactions/noteSearch.js';

test('multi-word searches match the literal phrase rather than any individual word', () => {
  const condition = buildNoteSearchCondition('  đi xem phim  ');
  assert.deepEqual(condition, { $regex: 'đi xem phim', $options: 'i' });

  const pattern = new RegExp(condition.$regex, condition.$options);
  assert.equal(pattern.test('Đi xem phim'), true);
  assert.equal(pattern.test('Tối qua đi xem phim cùng bạn'), true);
  assert.equal(pattern.test('Đi làm muộn'), false);
});

test('search is case-insensitive and special regex characters are treated literally', () => {
  const caseInsensitive = buildNoteSearchCondition('PHIM');
  assert.equal(new RegExp(caseInsensitive.$regex, caseInsensitive.$options).test('Đi xem phim'), true);

  const literal = buildNoteSearchCondition('.*[test]');
  assert.equal(literal.$regex, '\\.\\*\\[test\\]');
  assert.equal(new RegExp(literal.$regex, literal.$options).test('note .*[test] here'), true);
  assert.equal(new RegExp(literal.$regex, literal.$options).test('note arbitrary text here'), false);
});

test('empty or whitespace-only search terms do not add a note filter', () => {
  assert.equal(buildNoteSearchCondition(''), null);
  assert.equal(buildNoteSearchCondition('   '), null);
  assert.equal(buildNoteSearchCondition(undefined), null);
});
