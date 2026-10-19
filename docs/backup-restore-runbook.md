# Manual MongoDB Backup & Restore Runbook

**Purpose:** Provide the minimal manual backup-and-recovery procedure for NFR-08. This is an operator runbook, not an in-app backup feature or an automated backup schedule.

## 1. Prerequisites

- MongoDB Database Tools installed (`mongodump` and `mongorestore`).
- A reachable MongoDB instance and a database user with the required backup/restore permissions.
- Enough protected disk space for the archive.
- A backup destination with access controls. Do not commit backup archives, MongoDB credentials, or `.env` files to Git or include them in a public source ZIP.

## 2. Create a backup

For a local development database, open PowerShell in a private terminal and set the database URI for that terminal session:

```powershell
$env:MONGODB_URI = "mongodb://localhost:27017/expense-manager"
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
mongodump --uri="$env:MONGODB_URI" --archive="./expense-manager-$stamp.archive.gz" --gzip
```

For MongoDB Atlas, set `$env:MONGODB_URI` to the connection string copied from Atlas, with the correct database name and credentials. Treat that URI as a secret; do not paste it into source files, chat, screenshots, or version control. Make sure the current network/IP access list permits the connection.

After the command finishes, confirm the exit code is zero and the archive file exists with a plausible non-zero size. Move the archive to a protected location separate from the source working directory, and record the date/time and target database in a private operations note. Keep more than one recent backup when practical.

## 3. Test a restore without overwriting the source database

**Do not test recovery against the only copy of the original database.** Restore first into a separate temporary database. One way is to use a separate temporary MongoDB URI/database and restore the archive into that target:

```powershell
$env:RESTORE_TEST_URI = "mongodb://localhost:27017/expense-manager-restore-test"
mongorestore --uri="$env:RESTORE_TEST_URI" --archive="./expense-manager-YYYYMMDD-HHMMSS.archive.gz" --gzip --nsFrom="expense-manager.*" --nsTo="expense-manager-restore-test.*"
```

Replace the archive filename with the actual file. The namespace mapping assumes the archive was created from the `expense-manager` database. If the source database has another name, change `--nsFrom` accordingly.

After restoring, connect to the test database and verify that expected collections exist and representative documents can be read. For this project, check that the `users`, `transactions`, `categories`, and `budgets` collections exist when they contain data. Do not copy test restore data back into the live database as part of this check.

## 4. Recovery of a live database

1. Pause the application or prevent writes while recovery is in progress.
2. Identify and verify the intended target database and the exact backup archive.
3. Make a separate backup of the current target database before replacing anything.
4. Restore using the appropriate connection URI and namespace mapping for the target environment.
5. Verify data and essential user flows before reopening the application.

Options such as `--drop` can remove collections from the target before restoring. **Do not use `--drop` against any database unless replacing that database is explicitly intended, the target has been double-checked, and a separate current backup exists.** A wrong URI can destroy or overwrite the wrong environment.

## 5. Operational limitations

- This procedure is manual; it does not provide periodic scheduling, retention enforcement, restore automation, or monitoring.
- This does not implement user-facing backup/restore (FR-24), which remains outside the current MVP.
- Backup archives may contain personal and financial data. Restrict access, protect them at rest, and delete temporary test restores when finished.
