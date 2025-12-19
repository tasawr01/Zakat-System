# Deployment Instructions

## Prerequisites
- Oracle Database 19c or 21c
- Node.js 18+
- NPM

## 1. Database Setup
1. Connect to your Oracle Database as `SYSDBA`.
2. Run the schema setup script:
   ```sql
   @database/schema_setup.sql
   ```
3. (Optional) Run ETL scripts to import mock data:
   ```sql
   @database/etl_scripts.sql
   ```

## 2. Application Setup
1. Navigate to the `app_src` directory:
   ```bash
   cd app_src
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   - Create `.env.local`
   - Add DB credentials (if using real connection):
     ```
     ORACLE_USER=admin
     ORACLE_PASSWORD=secret
     ORACLE_CONN_STR=localhost:1521/XEPDB1
     ```

## 3. Running the App
- **Development**:
  ```bash
  npm run dev
  ```
  Access at `http://localhost:3000`

- **Production Build**:
  ```bash
  npm run build
  npm start
  ```

## 4. Backup & Recovery
- Use the RMAN script provided in `database/backup_recovery.rman` for regular backups.
