# Synthetic one-year demo history

## Purpose

`npm run seed:demo` inserts synthetic sample transactions and budgets for one existing local account. This is intended to populate the Personal Expense Manager charts and list screens for a school/demo presentation. The transactions are fictional; do not present them as a reconstruction of real personal finances.

## How to run

1. Start MongoDB and ensure `backend/.env` points to the development database you intend to use.
2. From `backend/`, run `npm run seed:demo`.
3. Enter the email address of the user already registered in the app.
4. Read the planned date range and record counts. Type exactly `ADD` only if you wish to continue; any other response cancels without inserting records.
5. Refresh the app. Visit Dashboard, Transactions, Budgets, and Statistics to view the history.

The script does not create a new user and does not require the user's password. It looks up the existing account by email and writes only records whose `userId` is that account's ID.

## Dataset behavior

- The date range is dynamically calculated as one year back from the local calendar day on which the script is run, through that day.
- Transaction dates stay within the selected range and are written at UTC noon to avoid common off-by-one-day display problems across time zones.
- Income uses the default `Lương` and `Thưởng` categories. Expenses use `Ăn uống`, `Di chuyển`, `Hóa đơn`, and `Giải trí`.
- Notes and amounts are synthetic and deterministic for a particular month/slot; they are not imported from bank data.
- The script adds monthly overall and category budgets only where that user's month/category slot is still empty. Existing budgets, including the user's current budget, are not modified.
- Existing salary or bonus income in a given month is preserved rather than adding a second generated salary/bonus entry for that category/month.
- New transaction IDs are deterministic per user and sample slot. Re-running the script therefore does not duplicate generated transactions.
- The script does not delete data, alter existing transactions, alter profile credentials, or change the default categories.

## Safety notes

- Use this only with a local/development database, not a production or real financial database.
- Make a database backup first if the database contains anything you cannot afford to lose.
- The `.env` file is deliberately excluded from project ZIPs; keep its JWT secret and MongoDB connection string private.
- To undo the sample dataset, delete the generated records through the app or restore a database backup. The script intentionally has no automatic deletion mode.
