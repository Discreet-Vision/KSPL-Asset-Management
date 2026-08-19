# cPanel & MySQL Production Deployment Guide
## KSPL Enterprise IT Asset Management (ITAM) + CMDB SaaS

This document provides a step-by-step production deployment guide for deploying the **KSPL ITAM Platform** on standard cPanel shared hosting with MySQL.

---

### 🚨 Quick Fix: Direct `public_html` Deployment (HTML/React + PHP API)

If you are uploading the contents of the `dist` folder directly to `public_html/` on cPanel, follow these 3 simple steps:

#### Why previous uploads showed errors:
1. **Missing `.htaccess` rewrite rules**: Without an `.htaccess` file in `public_html/`, Apache returned 404/405 errors whenever the browser sent requests to `/api/auth/register` or `/api/auth/login`.
2. **Dependent `api.php` path**: Previous builds contained a 44-byte `api.php` file pointing to `../api.php` outside `public_html/`.

#### How it is fixed now:
- `/public/api.php` is now a **100% standalone single PHP script** containing all 30 database table definitions, user registration, authentication, session token generation, and health checks.
- `/public/.htaccess` is now automatically included in the `/public` folder. When you run `npm run build`, `dist/` receives both `dist/api.php` and `dist/.htaccess`.

---

### Step 1: Create MySQL Database & User in cPanel
1. Log in to your cPanel dashboard.
2. Go to **MySQL Databases**.
3. Create a new database (e.g., `cpuser_itamdb`).
4. Create a new user (e.g., `cpuser_itamuser`) with a strong password.
5. Add the user to the database and select **ALL PRIVILEGES**.

---

### Step 2: Build & Upload `dist` Folder to `public_html`
1. Build the application:
   ```bash
   npm run build
   ```
2. Navigate to the generated `dist/` directory.
3. Compress all files inside `dist/` into a ZIP file (ensure `.htaccess` and `api.php` are included).
4. In cPanel **File Manager**, open `public_html/`.
5. Upload the ZIP file and **Extract** it directly into `public_html/`.

---

### Step 3: Configure Database Credentials in `public_html/api.php`
1. In cPanel File Manager, open `public_html/api.php` and click **Edit**.
2. Locate lines 20-24 and update your MySQL connection details:
   ```php
   $dbHost = 'localhost';
   $dbPort = '3306';
   $dbName = 'cpuser_itamdb';       // Replace with your cPanel DB name
   $dbUser = 'cpuser_itamuser';     // Replace with your cPanel DB user
   $dbPass = 'YourPassword123!';    // Replace with your cPanel DB password
   ```
3. Save changes.

---

### Step 4: Test Account Creation & Login
1. Open your domain (e.g., `https://your-domain.com`) in your web browser.
2. Click **Create Account** or **Login**.
3. When you register or log in, `api.php` will **automatically create and initialize all 30 database tables** on the fly without duplicate key errors!
4. You can also manually trigger schema creation anytime by opening:
   `https://your-domain.com/api.php?action=init_db`

---

### Complete List of 30 Database Tables Managed
1. `organizations` (Tenants & Accounts)
2. `users` (System Users & Role Hierarchy)
3. `mfa_secrets` (TOTP Keys & Encrypted Recovery Hashes)
4. `mfa_reset_requests` (Super Admin MFA Reset Queue)
5. `active_sessions` (Persistent Auth Tokens)
6. `departments` (Organizational Units)
7. `locations` (Data Centers, HQ & Warehouses)
8. `ci_classes` (CMDB Taxonomy & Schema Rules)
9. `configuration_items` (Hardware, Virtual, Cloud & Software CIs)
10. `ci_relationships` (CMDB Topology & Dependency Graph)
11. `discovery_jobs` (Network & Agentless Scan Engine)
12. `endpoint_agents` (Deployed Collector Agents)
13. `software_catalog` (Normalized Software Dictionary)
14. `drift_events` (Configuration & Security Drift Tracking)
15. `stockrooms` (Hardware Inventory & Warehouses)
16. `software_licenses` (SAM Entitlements & Compliance Gap)
17. `vendors` (Software & Hardware Suppliers)
18. `contracts` (MSAs, SaaS & Warranties)
19. `purchase_orders` (Procurement Orders)
20. `cost_centers` (Financial Budget Allocation)
21. `depreciation_schedules` (Financial Asset Lifecycle)
22. `disposal_records` (Certified Asset Disposal Records)
23. `itsm_tickets` (Incidents, Problems & Change Requests)
24. `workflow_definitions` (Approval Workflow Schemas)
25. `workflow_instances` (Active Approval Execution Flows)
26. `self_service_requests` (Employee Hardware/Software Requisitions)
27. `vulnerability_cves` (Security Vulnerabilities & Patches)
28. `policy_rules` (Governance & Compliance Rules)
29. `policy_violations` (Policy Audit Violations)
30. `audit_logs` (Immutable Action Audit Logs)

---

### Pre-Seeded Global Super Admin Account
The system auto-seeds the default Super Admin on database initialization:
- **Email**: `jitin@ucliktechnologies.com`
- **Role**: `SOFTWARE_SUPER_ADMIN`
- **Password**: `Password123!` (or user-created password on registration)

- **Organization ID**: `tenant-platform-global`

To verify, execute in phpMyAdmin SQL tab:
```sql
SELECT id, email, role, organization_id FROM users WHERE email = 'jitin@ucliktechnologies.com';
```

---

### Step 12: Configure Application URL
Ensure `APP_URL` in `.env` matches your full domain URL (e.g. `https://itam.ucliktechnologies.com`).

---

### Step 13: Configure HTTPS / SSL
1. In cPanel, navigate to **Security** -> **SSL/TLS Status**.
2. Select your domain name and click **Run AutoSSL** (Let's Encrypt / cPanel SSL).
3. Verify the certificate is active.

---

### Step 14: Configure Session & Cookie Settings
In `server.ts`, authentication tokens are stored in `Authorization: Bearer <token>` and validated against `active_sessions` table/store with a 24-hour expiration window.

---

### Step 15: Configure CORS
For production setup where frontend and backend run on the same domain or behind Apache proxy, CORS allows requests from `APP_URL`.

---

### Step 16: Configure Mail Settings (Optional)
If SMTP email notification for MFA resets or password resets is enabled, specify `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, and `MAIL_PASSWORD` in `.env`.

---

### Step 17: Configure Storage Permissions
Ensure the web server user has write permissions for uploads and temp directories:
```bash
chmod -R 755 /home/cpuser/kspl-itam
```

---

### Step 18: Configure Cron Jobs
To clean up expired session tokens automatically in cPanel:
1. Go to **Advanced** -> **Cron Jobs**.
2. Add a daily cron job:
   ```bash
   0 3 * * * curl -X POST https://your-domain.com/api/admin/cleanup-sessions >/dev/null 2>&1
   ```

---

### Step 19: Run Production Build
Run:
```bash
npm run build
```
Verify `dist/server.cjs` and `dist/index.html` exist.

---

### Step 20: Test Landing Page
Open `https://your-domain.com` in an unauthenticated browser window. Verify the public landing page renders with product highlights, login, and registration links.

---

### Step 21: Test Registration
1. Click **Create Account**.
2. Fill out organization name (e.g. `Acme Corp`) and user details (`acme_admin@example.com`).
3. Click **Register**.
4. Verify account creation succeeds and assigns role **CLIENT_SUPER_ADMIN** with tenant ID `tenant-<timestamp>`.

---

### Step 22: Test Login
1. Sign in with `acme_admin@example.com`.
2. Complete MFA verification step.
3. Verify redirection to **Client Super Admin Dashboard**.

---

### Step 23: Test Page Reload (Session Persistence)
1. While logged in as Client Super Admin, press **F5 / Browser Refresh**.
2. Verify you remain logged in without returning to the landing page.
3. Verify your active module screen is preserved.

---

### Step 24: Test Logout
1. Click profile icon -> **Sign Out**.
2. Verify session token is invalidated on server and client.
3. Verify immediate redirection to public landing page.

---

### Step 25: Test Software Super Admin
1. Sign in as `jitin@ucliktechnologies.com`.
2. Verify access to **Platform Control Console** (`/super-admin`).
3. Verify access to global tenant overview, global user management, and MFA reset request approvals.

---

### Step 26: Test Client Super Admin
Verify Client Super Admin can manage team members, IT assets, hardware, software licenses, and ITAM settings within their own tenant scope.

---

### Step 27: Test Team Member / Employee
1. Create a user with role `Employee` inside `Acme Corp`.
2. Log in with employee credentials.
3. Verify access is restricted to Employee Self-Service, Assigned Assets, and Support.

---

### Step 28: Test Tenant Data Isolation
1. As `Acme Corp` admin, verify you cannot view or switch to `Tenant B` data.
2. Verify non-Super Admin API calls with mismatched `tenantId` are rejected with `403 Forbidden`.

---

### Step 29: Test Multi-Factor Authentication (MFA)
1. Sign in with password.
2. Complete 6-digit TOTP code verification via Google/Microsoft Authenticator.
3. Verify single-use recovery code fallback.

---

### Step 30: Test Database Persistence
1. Perform asset creation or user registration.
2. Query MySQL database or check application state after dev server restart.
3. Verify records persist accurately.

---

### Step 31: Check Application & Server Logs
In cPanel, view **Error Log** or check Node application log stdout to ensure no unhandled exceptions or connection drops occur.

---

### Step 32: Perform Final Security Audit
1. Verify direct route `/super-admin` returns 403 / redirects to `/dashboard` when accessed by non-Super Admins.
2. Verify password hashes use `pbkdf2Sync` with unique cryptographic salt.
3. Verify no secrets, passwords, or API keys are exposed in client bundles or responses.
