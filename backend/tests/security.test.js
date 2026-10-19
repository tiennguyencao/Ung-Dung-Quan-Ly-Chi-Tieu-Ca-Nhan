import test from 'node:test';
import assert from 'node:assert/strict';
import { pick } from '../src/utils/pick.js';

// Regression guard for a confirmed exploit: a PUT body that passes
// express-validator could still carry extra keys, and Object.assign(doc, body)
// wrote them straight to the document — including userId, which moved the
// record into another account.

const TRANSACTION_FIELDS = ['categoryId', 'type', 'amount', 'date', 'note'];
const CATEGORY_FIELDS = ['name', 'icon', 'color'];
const USER_FIELDS = ['name', 'email'];

test('pick drops userId, so a transaction cannot be reassigned to another account', () => {
  const hostile = { amount: 1, userId: '507f1f77bcf86cd799439011' };
  const result = pick(hostile, TRANSACTION_FIELDS);
  assert.equal(result.userId, undefined);
  assert.equal(result.amount, 1);
});

test('pick drops userId and isDefault on categories', () => {
  // userId:null would publish a private category to every user, because
  // listCategories treats a null userId as "system default".
  const hostile = { name: 'Rent', userId: null, isDefault: true };
  const result = pick(hostile, CATEGORY_FIELDS);
  assert.deepEqual(result, { name: 'Rent' });
});

test('pick drops passwordHash and reset-token fields on the user profile', () => {
  const hostile = {
    name: 'Anh',
    passwordHash: '$2a$10$forged',
    passwordResetToken: 'x',
    passwordResetExpires: new Date(),
  };
  const result = pick(hostile, USER_FIELDS);
  assert.deepEqual(result, { name: 'Anh' });
});

test('pick keeps every legitimately writable field', () => {
  const legitimate = { categoryId: 'a', type: 'expense', amount: 50000, date: '2026-09-15', note: 'lunch' };
  assert.deepEqual(pick(legitimate, TRANSACTION_FIELDS), legitimate);
});

test('pick omits absent keys rather than writing undefined over existing values', () => {
  // A partial update must not blank out fields the client never sent.
  const result = pick({ amount: 10 }, TRANSACTION_FIELDS);
  assert.deepEqual(Object.keys(result), ['amount']);
  assert.ok(!('note' in result));
});

test('pick tolerates a missing or non-object body', () => {
  assert.deepEqual(pick(undefined, TRANSACTION_FIELDS), {});
  assert.deepEqual(pick(null, TRANSACTION_FIELDS), {});
  assert.deepEqual(pick('string', TRANSACTION_FIELDS), {});
});

test('password reset link is logged only in development when SMTP is unconfigured', async () => {
  const { sendPasswordResetEmail } = await import('../src/utils/mailer.js');
  const originalEnv = {
    NODE_ENV: process.env.NODE_ENV,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
  };
  const originalLog = console.log;
  const originalWarn = console.warn;
  const messages = [];

  process.env.NODE_ENV = 'development';
  delete process.env.SMTP_HOST;
  delete process.env.SMTP_PORT;
  delete process.env.SMTP_USER;
  delete process.env.SMTP_PASS;
  console.log = (message) => messages.push(String(message));
  console.warn = (message) => messages.push(String(message));

  try {
    await sendPasswordResetEmail({ to: 'a@b.com', resetUrl: 'http://localhost/reset-password?token=dev-only-token' });
  } finally {
    console.log = originalLog;
    console.warn = originalWarn;
    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }

  assert.equal(messages.length, 1);
  assert.match(messages[0], /dev only/);
  assert.match(messages[0], /token=dev-only-token/);
});

test('password reset link is never logged outside development when SMTP is unconfigured', async () => {
  const { sendPasswordResetEmail } = await import('../src/utils/mailer.js');
  const originalEnv = {
    NODE_ENV: process.env.NODE_ENV,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
  };
  const originalLog = console.log;
  const originalWarn = console.warn;
  const messages = [];

  process.env.NODE_ENV = 'production';
  delete process.env.SMTP_HOST;
  delete process.env.SMTP_PORT;
  delete process.env.SMTP_USER;
  delete process.env.SMTP_PASS;
  console.log = (message) => messages.push(String(message));
  console.warn = (message) => messages.push(String(message));

  try {
    await sendPasswordResetEmail({ to: 'a@b.com', resetUrl: 'https://example.com/reset-password?token=production-secret' });
  } finally {
    console.log = originalLog;
    console.warn = originalWarn;
    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }

  assert.equal(messages.length, 1);
  assert.doesNotMatch(messages.join(' '), /production-secret|a@b\.com/);
  assert.match(messages[0], /not configured/);
});
