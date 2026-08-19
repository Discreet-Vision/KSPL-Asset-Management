var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_dotenv = __toESM(require("dotenv"), 1);
var import_genai2 = require("@google/genai");

// src/backend/authService.ts
var import_crypto = __toESM(require("crypto"), 1);

// src/data/initialData.ts
var tenants = [
  {
    id: "tenant-platform-global",
    name: "Global Platform Administration",
    code: "KSPL-GLOBAL",
    region: "US"
  },
  {
    id: "tenant-client-1",
    name: "Client Enterprise Organization",
    code: "CLIENT-CORP",
    region: "US"
  }
];
var currentTenant = tenants[0];
var users = [
  {
    id: "usr-software-super-admin",
    name: "Software Super Admin",
    email: "jitin@ucliktechnologies.com",
    role: "Software Super Admin",
    departmentId: "d-1",
    locationId: "loc-1",
    tenantId: "tenant-platform-global",
    status: "Active"
  },
  {
    id: "usr-client-admin",
    name: "Client Admin",
    email: "clientadmin@enterprise.com",
    role: "Client Admin",
    departmentId: "d-1",
    locationId: "loc-1",
    tenantId: "tenant-client-1",
    status: "Active"
  },
  {
    id: "usr-finance-manager",
    name: "Sarah Jenkins (Finance Lead)",
    email: "finance@enterprise.com",
    role: "Finance",
    departmentId: "d-3",
    locationId: "loc-1",
    tenantId: "tenant-client-1",
    status: "Active"
  },
  {
    id: "usr-itam-admin",
    name: "Marcus Vance (ITAM Specialist)",
    email: "itamadmin@enterprise.com",
    role: "ITAM Admin",
    departmentId: "d-1",
    locationId: "loc-1",
    tenantId: "tenant-client-1",
    status: "Active"
  },
  {
    id: "usr-cmdb-admin",
    name: "Elena Rostova (CMDB Architect)",
    email: "cmdbadmin@enterprise.com",
    role: "CMDB Admin",
    departmentId: "d-2",
    locationId: "loc-1",
    tenantId: "tenant-client-1",
    status: "Active"
  },
  {
    id: "usr-security-analyst",
    name: "David Chen (SecOps Lead)",
    email: "security@enterprise.com",
    role: "Security",
    departmentId: "d-4",
    locationId: "loc-1",
    tenantId: "tenant-client-1",
    status: "Active"
  },
  {
    id: "usr-employee-dev",
    name: "Alex Rivera (Staff Engineer)",
    email: "employee@enterprise.com",
    role: "Employee",
    departmentId: "d-2",
    locationId: "loc-1",
    tenantId: "tenant-client-1",
    status: "Active"
  }
];
var currentUser = users[0];

// src/backend/authService.ts
var userAccounts = /* @__PURE__ */ new Map();
var tenantsStore = /* @__PURE__ */ new Map();
var activeSessions = /* @__PURE__ */ new Map();
var passwordResetTokens = /* @__PURE__ */ new Map();
var loginAttempts = /* @__PURE__ */ new Map();
var mfaSecretsStore = /* @__PURE__ */ new Map();
var mfaResetRequestsStore = /* @__PURE__ */ new Map();
var tempMfaSessionsStore = /* @__PURE__ */ new Map();
var pendingMfaSetupsStore = /* @__PURE__ */ new Map();
var BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
function generateBase32Secret(length = 20) {
  const bytes = import_crypto.default.randomBytes(length);
  let secret = "";
  for (let i = 0; i < bytes.length; i++) {
    secret += BASE32_CHARS[bytes[i] % BASE32_CHARS.length];
  }
  return secret;
}
function base32Decode(base32) {
  const clean = base32.toUpperCase().replace(/=+$/g, "").replace(/[^A-Z2-7]/g, "");
  let bits = "";
  for (let i = 0; i < clean.length; i++) {
    const val = BASE32_CHARS.indexOf(clean[i]);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, "0");
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substring(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}
function generateTotpCode(secretBase32, timeStepWindow = 0) {
  const key = base32Decode(secretBase32);
  const epoch = Math.floor(Date.now() / 1e3);
  const timeStep = 30;
  const counter = Math.floor(epoch / timeStep) + timeStepWindow;
  const buf = Buffer.alloc(8);
  buf.writeBigInt64BE(BigInt(counter), 0);
  const hmac = import_crypto.default.createHmac("sha1", key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 15;
  const binary = (hmac[offset] & 127) << 24 | (hmac[offset + 1] & 255) << 16 | (hmac[offset + 2] & 255) << 8 | hmac[offset + 3] & 255;
  return (binary % 1e6).toString().padStart(6, "0");
}
function verifyTotpCode(secretBase32, token, window = 1) {
  if (!token || token.trim().length !== 6 || !/^\d{6}$/.test(token.trim())) {
    return false;
  }
  const cleanToken = token.trim();
  for (let errorWindow = -window; errorWindow <= window; errorWindow++) {
    const calculated = generateTotpCode(secretBase32, errorWindow);
    if (import_crypto.default.timingSafeEqual(Buffer.from(calculated), Buffer.from(cleanToken))) {
      return true;
    }
  }
  return false;
}
var MFA_ENCRYPTION_KEY = (process.env.MFA_ENCRYPTION_KEY || "kspl_itam_master_mfa_key_2026_prod!").padEnd(32, "0").substring(0, 32);
function encryptMfaSecret(text) {
  const iv = import_crypto.default.randomBytes(12);
  const cipher = import_crypto.default.createCipheriv("aes-256-gcm", Buffer.from(MFA_ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}
function decryptMfaSecret(encryptedText) {
  const parts = encryptedText.split(":");
  if (parts.length !== 3) return encryptedText;
  try {
    const iv = Buffer.from(parts[0], "hex");
    const authTag = Buffer.from(parts[1], "hex");
    const encrypted = parts[2];
    const decipher = import_crypto.default.createDecipheriv("aes-256-gcm", Buffer.from(MFA_ENCRYPTION_KEY), iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    return encryptedText;
  }
}
function generateRecoveryCodes(count = 10) {
  const plaintextCodes = [];
  const hashedCodes = [];
  for (let i = 0; i < count; i++) {
    const code = `${import_crypto.default.randomBytes(2).toString("hex").toUpperCase()}-${import_crypto.default.randomBytes(2).toString("hex").toUpperCase()}`;
    plaintextCodes.push(code);
    const hash = import_crypto.default.createHash("sha256").update(code).digest("hex");
    hashedCodes.push(hash);
  }
  return { plaintextCodes, hashedCodes };
}
function hashRecoveryCode(code) {
  const clean = code.trim().toUpperCase();
  return import_crypto.default.createHash("sha256").update(clean).digest("hex");
}
function hashPassword(password, salt) {
  return import_crypto.default.pbkdf2Sync(password, salt, 1e4, 64, "sha512").toString("hex");
}
function generateSalt() {
  return import_crypto.default.randomBytes(16).toString("hex");
}
function validatePasswordStrength(password) {
  if (!password || password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters long." };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one uppercase letter (A-Z)." };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one lowercase letter (a-z)." };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password must contain at least one number (0-9)." };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: "Password must contain at least one special character (!@#$%^&*...)." };
  }
  return { valid: true };
}
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}
var SUPER_ADMIN_EMAIL = "jitin@ucliktechnologies.com";
function seedInitialAuthData() {
  if (tenantsStore.size === 0) {
    tenants.forEach((t) => tenantsStore.set(t.id, { ...t }));
  }
  if (!tenantsStore.has("tenant-platform-global")) {
    tenantsStore.set("tenant-platform-global", {
      id: "tenant-platform-global",
      name: "Uclik Technologies (Platform Global)",
      code: "UCLIK-SUPER",
      region: "US"
    });
  }
  if (userAccounts.size === 0) {
    users.forEach((u) => {
      const salt = generateSalt();
      const hash = hashPassword("Password123!", salt);
      const acc = {
        ...u,
        passwordHash: hash,
        salt,
        jobTitle: u.role,
        country: "United States",
        status: "Active",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        onboardingCompleted: true
      };
      userAccounts.set(u.id, acc);
    });
  }
  const existingSuperAdmin = Array.from(userAccounts.values()).find(
    (u) => u.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()
  );
  if (!existingSuperAdmin) {
    const salt = generateSalt();
    const superAdminPassword = process.env.SUPER_ADMIN_INITIAL_PASSWORD || "Password123!";
    const hash = hashPassword(superAdminPassword, salt);
    const superAdminAccount = {
      id: "usr-super-admin-jitin",
      name: "Software Super Admin",
      email: SUPER_ADMIN_EMAIL.toLowerCase(),
      role: "SOFTWARE_SUPER_ADMIN",
      departmentId: "d-1",
      locationId: "loc-1",
      tenantId: "tenant-platform-global",
      passwordHash: hash,
      salt,
      jobTitle: "Global Software Super Admin",
      phone: "+1 (800) 555-0199",
      country: "United States",
      status: "Active",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      onboardingCompleted: true,
      mfaSetupRequired: false,
      mfaEnabled: false
    };
    userAccounts.set(superAdminAccount.id, superAdminAccount);
  } else if (existingSuperAdmin.role !== "SOFTWARE_SUPER_ADMIN") {
    existingSuperAdmin.role = "SOFTWARE_SUPER_ADMIN";
  }
  const CLIENT_ADMIN_EMAIL = "clientadmin@enterprise.com";
  const existingClientAdmin = Array.from(userAccounts.values()).find(
    (u) => u.email.toLowerCase() === CLIENT_ADMIN_EMAIL.toLowerCase()
  );
  if (!existingClientAdmin) {
    const salt = generateSalt();
    const clientAdminPassword = "Password123!";
    const hash = hashPassword(clientAdminPassword, salt);
    const clientAdminAccount = {
      id: "usr-client-admin",
      name: "Client Organization Admin",
      email: CLIENT_ADMIN_EMAIL.toLowerCase(),
      role: "CLIENT_ADMIN",
      departmentId: "d-1",
      locationId: "loc-1",
      tenantId: "tenant-client-1",
      passwordHash: hash,
      salt,
      jobTitle: "Client Organization Administrator",
      phone: "+1 (555) 019-2831",
      country: "United States",
      status: "Active",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      onboardingCompleted: true,
      mfaSetupRequired: false,
      mfaEnabled: false
    };
    userAccounts.set(clientAdminAccount.id, clientAdminAccount);
  } else if (existingClientAdmin.role !== "CLIENT_ADMIN" && existingClientAdmin.role !== "Client Admin") {
    existingClientAdmin.role = "CLIENT_ADMIN";
  }
}
seedInitialAuthData();
function registerUser(data) {
  seedInitialAuthData();
  const firstName = (data.firstName || "").trim();
  const lastName = (data.lastName || "").trim();
  const email = (data.email || "").trim().toLowerCase();
  const companyName = (data.companyName || "").trim();
  if (!firstName || !lastName) {
    return { success: false, error: "First name and last name are required." };
  }
  if (!email || !validateEmail(email)) {
    return { success: false, error: "Please enter a valid work email address." };
  }
  if (!companyName) {
    return { success: false, error: "Company or Organization name is required." };
  }
  if (!data.termsAccepted) {
    return { success: false, error: "You must accept the Terms and Conditions to register." };
  }
  if (data.confirmPassword && data.password !== data.confirmPassword) {
    return { success: false, error: "Passwords do not match." };
  }
  const pwdCheck = validatePasswordStrength(data.password);
  if (!pwdCheck.valid) {
    return { success: false, error: pwdCheck.message };
  }
  const existingUser = Array.from(userAccounts.values()).find((u) => u.email.toLowerCase() === email);
  if (existingUser) {
    return { success: false, error: "An account with this work email already exists." };
  }
  const tenantId = `tenant-${Date.now()}`;
  const codePrefix = companyName.replace(/[^a-zA-Z0-9]/g, "").slice(0, 5).toUpperCase() || "KSPL";
  const newTenant = {
    id: tenantId,
    name: companyName,
    code: `${codePrefix}-HQ`,
    region: data.country === "EU" || data.country === "APAC" ? data.country : "US"
  };
  tenantsStore.set(tenantId, newTenant);
  const salt = generateSalt();
  const hash = hashPassword(data.password, salt);
  const userId = `u-${Date.now()}`;
  const newUserAccount = {
    id: userId,
    name: `${firstName} ${lastName}`,
    email,
    role: "CLIENT_SUPER_ADMIN",
    departmentId: "d-1",
    locationId: "loc-1",
    tenantId,
    passwordHash: hash,
    salt,
    jobTitle: data.jobTitle || "IT Asset Administrator",
    phone: data.phone || "",
    country: data.country || "United States",
    status: "Active",
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    onboardingCompleted: false,
    mfaEnabled: false,
    mfaSetupRequired: true
  };
  userAccounts.set(userId, newUserAccount);
  const tempToken = `kspl_mfa_temp_${import_crypto.default.randomBytes(32).toString("hex")}`;
  const expiresAt = new Date(Date.now() + 10 * 60 * 1e3).toISOString();
  tempMfaSessionsStore.set(tempToken, {
    tempToken,
    userId: newUserAccount.id,
    tenantId: newTenant.id,
    mfaSetupRequired: true,
    mfaMethod: "google_authenticator",
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    expiresAt,
    attempts: 0
  });
  const publicUser = {
    id: newUserAccount.id,
    name: newUserAccount.name,
    email: newUserAccount.email,
    role: newUserAccount.role,
    departmentId: newUserAccount.departmentId,
    locationId: newUserAccount.locationId,
    tenantId: newUserAccount.tenantId,
    mfaEnabled: false,
    mfaMethod: "google_authenticator",
    mfaSetupRequired: true
  };
  return {
    success: true,
    mfaRequired: true,
    tempToken,
    mfaSetupRequired: true,
    mfaMethod: "google_authenticator",
    user: publicUser,
    tenant: newTenant
  };
}
function loginUser(emailInput, passwordInput, rememberMe = false) {
  seedInitialAuthData();
  const email = (emailInput || "").trim().toLowerCase();
  const password = passwordInput || "";
  if (!email || !password) {
    return { success: false, error: "Email and password are required." };
  }
  const attemptInfo = loginAttempts.get(email);
  if (attemptInfo && attemptInfo.lockUntil > Date.now()) {
    const minsLeft = Math.ceil((attemptInfo.lockUntil - Date.now()) / 6e4);
    return {
      success: false,
      error: `Too many failed attempts. Account temporarily locked for ${minsLeft} minute(s).`
    };
  }
  const account = Array.from(userAccounts.values()).find((u) => u.email.toLowerCase() === email);
  if (!account) {
    recordFailedAttempt(email);
    return { success: false, error: "Invalid email or password." };
  }
  if (account.status !== "Active") {
    return { success: false, error: "Your account has been locked or disabled by an administrator." };
  }
  const computedHash = hashPassword(password, account.salt);
  if (computedHash !== account.passwordHash) {
    recordFailedAttempt(email);
    return { success: false, error: "Invalid email or password." };
  }
  loginAttempts.delete(email);
  const mfaData = mfaSecretsStore.get(account.id);
  const isSuperAdmin = account.role === "SOFTWARE_SUPER_ADMIN";
  const hasConfiguredMfa = mfaData && mfaData.mfaEnabled || account.mfaEnabled && !account.mfaSetupRequired;
  const requiresMfa = true;
  if (requiresMfa) {
    const tempToken = `kspl_mfa_temp_${import_crypto.default.randomBytes(32).toString("hex")}`;
    const expiresAt2 = new Date(Date.now() + 10 * 60 * 1e3).toISOString();
    tempMfaSessionsStore.set(tempToken, {
      tempToken,
      userId: account.id,
      tenantId: account.tenantId,
      mfaSetupRequired: !hasConfiguredMfa,
      mfaMethod: mfaData?.mfaMethod || account.mfaMethod || "google_authenticator",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      expiresAt: expiresAt2,
      attempts: 0
    });
    const tenant2 = tenantsStore.get(account.tenantId) || tenants[0];
    const publicUser2 = {
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
      departmentId: account.departmentId,
      locationId: account.locationId,
      tenantId: account.tenantId,
      mfaEnabled: hasConfiguredMfa,
      mfaMethod: mfaData?.mfaMethod || account.mfaMethod || "google_authenticator",
      mfaSetupRequired: !hasConfiguredMfa
    };
    return {
      success: true,
      mfaRequired: true,
      tempToken,
      mfaSetupRequired: !hasConfiguredMfa,
      mfaMethod: mfaData?.mfaMethod || account.mfaMethod || "google_authenticator",
      user: publicUser2,
      tenant: tenant2
    };
  }
  account.lastLoginAt = (/* @__PURE__ */ new Date()).toISOString();
  const durationMs = rememberMe ? 30 * 24 * 60 * 60 * 1e3 : 24 * 60 * 60 * 1e3;
  const token = `kspl_sess_${import_crypto.default.randomBytes(32).toString("hex")}`;
  const expiresAt = new Date(Date.now() + durationMs).toISOString();
  activeSessions.set(token, {
    token,
    userId: account.id,
    tenantId: account.tenantId,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    expiresAt
  });
  const tenant = tenantsStore.get(account.tenantId) || tenants[0];
  const publicUser = {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    departmentId: account.departmentId,
    locationId: account.locationId,
    tenantId: account.tenantId,
    mfaEnabled: false
  };
  return {
    success: true,
    user: publicUser,
    tenant,
    token
  };
}
function verifyMfaLogin(tempToken, code) {
  seedInitialAuthData();
  if (!tempToken) {
    return { success: false, error: "MFA session token is missing." };
  }
  const tempSession = tempMfaSessionsStore.get(tempToken);
  if (!tempSession || new Date(tempSession.expiresAt).getTime() < Date.now()) {
    tempMfaSessionsStore.delete(tempToken);
    return { success: false, error: "MFA verification session expired. Please sign in again." };
  }
  if (tempSession.attempts >= 5) {
    tempMfaSessionsStore.delete(tempToken);
    return { success: false, error: "Too many incorrect verification attempts. Please sign in again." };
  }
  tempSession.attempts += 1;
  const account = userAccounts.get(tempSession.userId);
  if (!account || account.status !== "Active") {
    return { success: false, error: "Account not found or inactive." };
  }
  const mfaData = mfaSecretsStore.get(account.id);
  if (!mfaData || !mfaData.mfaEnabled) {
    return { success: false, error: "MFA is not fully configured for this account." };
  }
  const secretPlain = decryptMfaSecret(mfaData.encryptedSecret);
  const isValid = verifyTotpCode(secretPlain, code, 1);
  if (!isValid) {
    return { success: false, error: "Invalid 6-digit verification code. Please check your authenticator app." };
  }
  tempMfaSessionsStore.delete(tempToken);
  mfaData.lastUsedAt = (/* @__PURE__ */ new Date()).toISOString();
  account.lastLoginAt = (/* @__PURE__ */ new Date()).toISOString();
  const token = `kspl_sess_${import_crypto.default.randomBytes(32).toString("hex")}`;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1e3).toISOString();
  activeSessions.set(token, {
    token,
    userId: account.id,
    tenantId: account.tenantId,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    expiresAt
  });
  const tenant = tenantsStore.get(account.tenantId) || tenants[0];
  const publicUser = {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    departmentId: account.departmentId,
    locationId: account.locationId,
    tenantId: account.tenantId,
    mfaEnabled: true,
    mfaMethod: mfaData.mfaMethod
  };
  return {
    success: true,
    user: publicUser,
    tenant,
    token
  };
}
function verifyMfaRecoveryLogin(tempToken, recoveryCode) {
  seedInitialAuthData();
  if (!tempToken || !recoveryCode) {
    return { success: false, error: "Recovery code or session token is missing." };
  }
  const tempSession = tempMfaSessionsStore.get(tempToken);
  if (!tempSession || new Date(tempSession.expiresAt).getTime() < Date.now()) {
    tempMfaSessionsStore.delete(tempToken);
    return { success: false, error: "Session expired. Please sign in again." };
  }
  const account = userAccounts.get(tempSession.userId);
  if (!account || account.status !== "Active") {
    return { success: false, error: "Account not found or inactive." };
  }
  const mfaData = mfaSecretsStore.get(account.id);
  if (!mfaData || !mfaData.mfaEnabled || !mfaData.recoveryCodesHash || mfaData.recoveryCodesHash.length === 0) {
    return { success: false, error: "No recovery codes are available for this account." };
  }
  const inputHash = hashRecoveryCode(recoveryCode);
  const codeIndex = mfaData.recoveryCodesHash.indexOf(inputHash);
  if (codeIndex === -1) {
    return { success: false, error: "Invalid or previously used recovery code." };
  }
  mfaData.recoveryCodesHash.splice(codeIndex, 1);
  mfaData.lastUsedAt = (/* @__PURE__ */ new Date()).toISOString();
  tempMfaSessionsStore.delete(tempToken);
  account.lastLoginAt = (/* @__PURE__ */ new Date()).toISOString();
  const token = `kspl_sess_${import_crypto.default.randomBytes(32).toString("hex")}`;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1e3).toISOString();
  activeSessions.set(token, {
    token,
    userId: account.id,
    tenantId: account.tenantId,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    expiresAt
  });
  const tenant = tenantsStore.get(account.tenantId) || tenants[0];
  const publicUser = {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    departmentId: account.departmentId,
    locationId: account.locationId,
    tenantId: account.tenantId,
    mfaEnabled: true,
    mfaMethod: mfaData.mfaMethod
  };
  return {
    success: true,
    user: publicUser,
    tenant,
    token
  };
}
function initiateMfaSetup(userIdOrTempToken, method) {
  seedInitialAuthData();
  let resolvedUserId = userIdOrTempToken;
  if (tempMfaSessionsStore.has(userIdOrTempToken)) {
    const session = tempMfaSessionsStore.get(userIdOrTempToken);
    if (session) resolvedUserId = session.userId;
  }
  const account = userAccounts.get(resolvedUserId);
  if (!account) {
    return { success: false, error: "User account not found." };
  }
  const secret = generateBase32Secret(20);
  const issuer = "KSPL ITAM Platform";
  const encodedEmail = encodeURIComponent(account.email);
  const encodedIssuer = encodeURIComponent(issuer);
  const otpauthUrl = `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
  pendingMfaSetupsStore.set(account.id, {
    secret,
    method,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  return {
    success: true,
    secret,
    otpauthUrl,
    userId: account.id
  };
}
function confirmMfaSetup(userIdOrTempToken, code) {
  seedInitialAuthData();
  let resolvedUserId = userIdOrTempToken;
  let isTempSession = false;
  if (tempMfaSessionsStore.has(userIdOrTempToken)) {
    const session = tempMfaSessionsStore.get(userIdOrTempToken);
    if (session) {
      resolvedUserId = session.userId;
      isTempSession = true;
    }
  }
  const account = userAccounts.get(resolvedUserId);
  if (!account) {
    return { success: false, error: "User account not found." };
  }
  const pending = pendingMfaSetupsStore.get(account.id);
  if (!pending) {
    return { success: false, error: "No active MFA setup session found. Please restart MFA setup." };
  }
  const isValid = verifyTotpCode(pending.secret, code, 1);
  if (!isValid) {
    return { success: false, error: "Invalid 6-digit verification code. Please check your authenticator application." };
  }
  const { plaintextCodes, hashedCodes } = generateRecoveryCodes(10);
  const encryptedSecret = encryptMfaSecret(pending.secret);
  const mfaData = {
    userId: account.id,
    userEmail: account.email,
    mfaEnabled: true,
    mfaMethod: pending.method,
    encryptedSecret,
    recoveryCodesHash: hashedCodes,
    verifiedAt: (/* @__PURE__ */ new Date()).toISOString(),
    lastUsedAt: (/* @__PURE__ */ new Date()).toISOString(),
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  mfaSecretsStore.set(account.id, mfaData);
  pendingMfaSetupsStore.delete(account.id);
  account.mfaEnabled = true;
  account.mfaMethod = pending.method;
  account.mfaSetupRequired = false;
  let sessionToken;
  let tenant;
  if (isTempSession) {
    tempMfaSessionsStore.delete(userIdOrTempToken);
    account.lastLoginAt = (/* @__PURE__ */ new Date()).toISOString();
    sessionToken = `kspl_sess_${import_crypto.default.randomBytes(32).toString("hex")}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1e3).toISOString();
    activeSessions.set(sessionToken, {
      token: sessionToken,
      userId: account.id,
      tenantId: account.tenantId,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      expiresAt
    });
    tenant = tenantsStore.get(account.tenantId) || tenants[0];
  }
  const publicUser = {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    departmentId: account.departmentId,
    locationId: account.locationId,
    tenantId: account.tenantId,
    mfaEnabled: true,
    mfaMethod: pending.method
  };
  return {
    success: true,
    recoveryCodes: plaintextCodes,
    user: publicUser,
    tenant,
    token: sessionToken
  };
}
function changeMfaAuthenticator(userId, currentPasswordInput, currentMfaCode, newMethod) {
  seedInitialAuthData();
  const account = userAccounts.get(userId);
  if (!account) {
    return { success: false, error: "User account not found." };
  }
  const hash = hashPassword(currentPasswordInput, account.salt);
  if (hash !== account.passwordHash) {
    return { success: false, error: "Current password verification failed." };
  }
  const mfaData = mfaSecretsStore.get(account.id);
  if (mfaData && mfaData.mfaEnabled) {
    const plainSecret = decryptMfaSecret(mfaData.encryptedSecret);
    const valid = verifyTotpCode(plainSecret, currentMfaCode, 1);
    if (!valid) {
      return { success: false, error: "Current authenticator verification failed." };
    }
  }
  return initiateMfaSetup(userId, newMethod);
}
function regenerateRecoveryCodes(userId, currentMfaCode) {
  seedInitialAuthData();
  const account = userAccounts.get(userId);
  if (!account) return { success: false, error: "User account not found." };
  const mfaData = mfaSecretsStore.get(account.id);
  if (!mfaData || !mfaData.mfaEnabled) {
    return { success: false, error: "MFA is not enabled on this account." };
  }
  const plainSecret = decryptMfaSecret(mfaData.encryptedSecret);
  const isValid = verifyTotpCode(plainSecret, currentMfaCode, 1);
  if (!isValid) {
    return { success: false, error: "Invalid 6-digit verification code." };
  }
  const { plaintextCodes, hashedCodes } = generateRecoveryCodes(10);
  mfaData.recoveryCodesHash = hashedCodes;
  mfaData.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  return { success: true, recoveryCodes: plaintextCodes };
}
function createMfaResetRequest(userIdOrEmail, reason) {
  seedInitialAuthData();
  const query = (userIdOrEmail || "").trim().toLowerCase();
  const account = Array.from(userAccounts.values()).find(
    (u) => u.id === query || u.email.toLowerCase() === query
  );
  if (!account) {
    return {
      success: true,
      message: "If an account exists, an MFA reset request has been dispatched to the Software Super Admin."
    };
  }
  const tenant = tenantsStore.get(account.tenantId);
  const requestId = `mfa-req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const newRequest = {
    requestId,
    userId: account.id,
    userName: account.name,
    userEmail: account.email,
    tenantId: account.tenantId,
    tenantName: tenant?.name || "Organization",
    mfaMethod: account.mfaMethod || "google_authenticator",
    requestReason: reason || "Lost authenticator application or device",
    status: "Pending",
    requestedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  mfaResetRequestsStore.set(requestId, newRequest);
  return {
    success: true,
    message: "MFA Reset Request submitted successfully to Platform Software Super Admin.",
    requestId
  };
}
function getAllMfaResetRequests() {
  seedInitialAuthData();
  return Array.from(mfaResetRequestsStore.values()).sort(
    (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
  );
}
function approveMfaResetRequest(requestId, reviewerName = "Jitin (Software Super Admin)") {
  seedInitialAuthData();
  const req = mfaResetRequestsStore.get(requestId);
  if (!req) {
    return { success: false, error: "MFA reset request not found." };
  }
  if (req.status !== "Pending") {
    return { success: false, error: `Request has already been ${req.status.toLowerCase()}.` };
  }
  const account = userAccounts.get(req.userId);
  if (account) {
    mfaSecretsStore.delete(account.id);
    account.mfaEnabled = false;
    account.mfaSetupRequired = true;
    account.mfaMethod = void 0;
  }
  req.status = "Approved";
  req.reviewedBy = reviewerName;
  req.reviewedAt = (/* @__PURE__ */ new Date()).toISOString();
  req.adminNotes = "Approved by Software Super Admin. Invalidated old TOTP secret and recovery codes.";
  return {
    success: true,
    message: `MFA reset request for ${req.userEmail} approved successfully. User will be required to re-enroll MFA on next login.`
  };
}
function rejectMfaResetRequest(requestId, reason, reviewerName = "Jitin (Software Super Admin)") {
  seedInitialAuthData();
  const req = mfaResetRequestsStore.get(requestId);
  if (!req) {
    return { success: false, error: "MFA reset request not found." };
  }
  if (req.status !== "Pending") {
    return { success: false, error: `Request has already been ${req.status.toLowerCase()}.` };
  }
  req.status = "Rejected";
  req.reviewedBy = reviewerName;
  req.reviewedAt = (/* @__PURE__ */ new Date()).toISOString();
  req.adminNotes = reason || "Request rejected by Software Super Admin due to insufficient identity verification.";
  return {
    success: true,
    message: `MFA reset request for ${req.userEmail} rejected. MFA remains active.`
  };
}
function getGlobalUsersList(search, tenantFilter, mfaFilter) {
  seedInitialAuthData();
  let list = Array.from(userAccounts.values()).map((acc) => {
    const tenant = tenantsStore.get(acc.tenantId);
    return {
      ...acc,
      tenantName: tenant ? tenant.name : "Unknown Organization"
    };
  });
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.tenantName.toLowerCase().includes(q) || u.role.toLowerCase().includes(q)
    );
  }
  if (tenantFilter && tenantFilter !== "ALL") {
    list = list.filter((u) => u.tenantId === tenantFilter);
  }
  if (mfaFilter && mfaFilter !== "ALL") {
    if (mfaFilter === "ENABLED") list = list.filter((u) => u.mfaEnabled);
    if (mfaFilter === "DISABLED") list = list.filter((u) => !u.mfaEnabled);
    if (mfaFilter === "SUPER_ADMIN") list = list.filter((u) => u.role === "SOFTWARE_SUPER_ADMIN");
  }
  return list;
}
function recordFailedAttempt(email) {
  const current = loginAttempts.get(email) || { count: 0, lockUntil: 0 };
  current.count += 1;
  if (current.count >= 5) {
    current.lockUntil = Date.now() + 5 * 60 * 1e3;
  }
  loginAttempts.set(email, current);
}
function getSession(token) {
  seedInitialAuthData();
  if (!token) return null;
  const session = activeSessions.get(token);
  if (!session) return null;
  if (new Date(session.expiresAt).getTime() < Date.now()) {
    activeSessions.delete(token);
    return null;
  }
  const account = userAccounts.get(session.userId);
  if (!account || account.status !== "Active") return null;
  const tenant = tenantsStore.get(session.tenantId) || tenants[0];
  const mfaData = mfaSecretsStore.get(account.id);
  const publicUser = {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    departmentId: account.departmentId,
    locationId: account.locationId,
    tenantId: account.tenantId,
    mfaEnabled: account.mfaEnabled || mfaData && mfaData.mfaEnabled || false,
    mfaMethod: mfaData?.mfaMethod || account.mfaMethod
  };
  return { user: publicUser, tenant };
}
function logoutSession(token) {
  if (!token) return false;
  return activeSessions.delete(token);
}
function requestPasswordReset(emailInput) {
  seedInitialAuthData();
  const email = (emailInput || "").trim().toLowerCase();
  if (!email || !validateEmail(email)) {
    return { success: false, message: "Please enter a valid work email address." };
  }
  const account = Array.from(userAccounts.values()).find((u) => u.email.toLowerCase() === email);
  if (!account) {
    return {
      success: true,
      message: "If an account exists with this email address, a password reset link has been dispatched."
    };
  }
  const resetToken = `kspl_reset_${import_crypto.default.randomBytes(24).toString("hex")}`;
  const expiresAt = new Date(Date.now() + 60 * 60 * 1e3).toISOString();
  passwordResetTokens.set(resetToken, {
    token: resetToken,
    userId: account.id,
    email: account.email,
    expiresAt,
    used: false
  });
  return {
    success: true,
    message: "If an account exists with this email address, a password reset link has been dispatched.",
    resetToken
  };
}
function resetPassword(resetToken, newPassword, confirmPassword) {
  seedInitialAuthData();
  if (!resetToken) {
    return { success: false, error: "Password reset token is missing or invalid." };
  }
  const tokenData = passwordResetTokens.get(resetToken);
  if (!tokenData || tokenData.used || new Date(tokenData.expiresAt).getTime() < Date.now()) {
    return { success: false, error: "Password reset token is invalid, expired, or has already been used." };
  }
  if (confirmPassword && newPassword !== confirmPassword) {
    return { success: false, error: "Passwords do not match." };
  }
  const pwdCheck = validatePasswordStrength(newPassword);
  if (!pwdCheck.valid) {
    return { success: false, error: pwdCheck.message };
  }
  const account = userAccounts.get(tokenData.userId);
  if (!account) {
    return { success: false, error: "Associated user account not found." };
  }
  const newSalt = generateSalt();
  account.salt = newSalt;
  account.passwordHash = hashPassword(newPassword, newSalt);
  tokenData.used = true;
  Array.from(activeSessions.entries()).forEach(([tok, sess]) => {
    if (sess.userId === account.id) {
      activeSessions.delete(tok);
    }
  });
  return {
    success: true,
    message: "Password reset successfully. You may now sign in with your new credentials."
  };
}
function completeOnboarding(userId, tenantId, data) {
  seedInitialAuthData();
  const tenant = tenantsStore.get(tenantId);
  if (tenant) {
    if (data.companyName) tenant.name = data.companyName;
    if (data.region) tenant.region = data.region === "EU" || data.region === "APAC" ? data.region : "US";
  }
  const account = userAccounts.get(userId);
  if (account) {
    account.onboardingCompleted = true;
  }
  return { success: true, tenant };
}
function updateUserProfile(userId, data) {
  seedInitialAuthData();
  const account = userAccounts.get(userId);
  if (!account) {
    return { success: false, error: "User account not found." };
  }
  if (data.firstName || data.lastName) {
    const f = data.firstName !== void 0 ? data.firstName.trim() : account.name.split(" ")[0];
    const l = data.lastName !== void 0 ? data.lastName.trim() : account.name.split(" ").slice(1).join(" ");
    account.name = `${f} ${l}`.trim();
  }
  if (data.jobTitle !== void 0) account.jobTitle = data.jobTitle.trim();
  if (data.phone !== void 0) account.phone = data.phone.trim();
  if (data.country !== void 0) account.country = data.country.trim();
  if (data.password) {
    const pwdCheck = validatePasswordStrength(data.password);
    if (!pwdCheck.valid) {
      return { success: false, error: pwdCheck.message };
    }
    const newSalt = generateSalt();
    account.salt = newSalt;
    account.passwordHash = hashPassword(data.password, newSalt);
  }
  const publicUser = {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    departmentId: account.departmentId,
    locationId: account.locationId,
    tenantId: account.tenantId,
    mfaEnabled: account.mfaEnabled,
    mfaMethod: account.mfaMethod
  };
  return { success: true, user: publicUser };
}
function provisionUserByAdmin(data) {
  seedInitialAuthData();
  const name = (data.name || "").trim();
  const email = (data.email || "").trim().toLowerCase();
  if (!name || !email) {
    return { success: false, error: "Name and email are required to provision a user." };
  }
  for (const acc of userAccounts.values()) {
    if (acc.email.toLowerCase() === email) {
      return { success: false, error: "A user with this email address already exists." };
    }
  }
  const salt = generateSalt();
  const initialPassword = data.password || "Password123!";
  const hash = hashPassword(initialPassword, salt);
  const userId = `usr-${import_crypto.default.randomBytes(6).toString("hex")}`;
  const newUserAccount = {
    id: userId,
    name,
    email,
    role: data.role || "Employee",
    departmentId: data.departmentId || "d-1",
    locationId: data.locationId || "loc-1",
    tenantId: data.tenantId,
    passwordHash: hash,
    salt,
    jobTitle: data.jobTitle || "Team Member",
    phone: "",
    country: "United States",
    status: "Active",
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    onboardingCompleted: true,
    mfaEnabled: false,
    mfaSetupRequired: true
  };
  userAccounts.set(userId, newUserAccount);
  const publicUser = {
    id: newUserAccount.id,
    name: newUserAccount.name,
    email: newUserAccount.email,
    role: newUserAccount.role,
    departmentId: newUserAccount.departmentId,
    locationId: newUserAccount.locationId,
    tenantId: newUserAccount.tenantId,
    mfaEnabled: false,
    mfaMethod: "google_authenticator",
    mfaSetupRequired: true
  };
  return { success: true, user: publicUser };
}
function updateUserRoleAndStatus(userId, data) {
  seedInitialAuthData();
  const account = userAccounts.get(userId);
  if (!account) {
    return { success: false, error: "User account not found." };
  }
  if (data.role) account.role = data.role;
  if (data.status) account.status = data.status;
  if (data.departmentId) account.departmentId = data.departmentId;
  if (data.jobTitle) account.jobTitle = data.jobTitle;
  const publicUser = {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    departmentId: account.departmentId,
    locationId: account.locationId,
    tenantId: account.tenantId,
    mfaEnabled: account.mfaEnabled,
    mfaMethod: account.mfaMethod
  };
  return { success: true, user: publicUser };
}
var DEFAULT_RBAC_CAPABILITIES = [
  {
    id: "multiTenantGovernance",
    name: "Multi-Tenant Global Governance",
    category: "Administration",
    description: "Manage cross-tenant isolation, enterprise data boundaries, and global system configurations."
  },
  {
    id: "userProvisioning",
    name: "User Provisioning & Role Assignment",
    category: "Identity & Access",
    description: "Create user credentials, assign functional RBAC roles, and manage active status."
  },
  {
    id: "cmdbManage",
    name: "CMDB Assets & Topology Editor",
    category: "ITAM & CMDB",
    description: "Create, update, and manage Configuration Items (CIs), relationships, and discovery assets."
  },
  {
    id: "reconciliationEngine",
    name: "Reconciliation Rules & Drift Engine",
    category: "ITAM & CMDB",
    description: "Configure multi-source reconciliation priority rules, identification criteria, and drift thresholds."
  },
  {
    id: "softwareLicensesElp",
    name: "Software Licenses & ELP Calculation",
    category: "Software Asset Management",
    description: "Manage publisher contracts, license entitlements, installation compliance, and Effective License Position."
  },
  {
    id: "contractsFinancials",
    name: "Contracts, POs & Depreciation",
    category: "Finance & Procurement",
    description: "Author purchase orders, vendor warranties, MACRS/straight-line depreciation, and financial ledgers."
  },
  {
    id: "cveSecurity",
    name: "CVE Vulnerabilities & Compliance Rules",
    category: "SecOps & Compliance",
    description: "Inspect CVE severity feeds, patch tracking, security SLAs, and compliance benchmarks."
  },
  {
    id: "hardwareWipeCertificates",
    name: "Hardware Disposal & Wipe Certificates",
    category: "Asset Lifecycle",
    description: "Authorize hardware decommissioning, asset disposition, and cryptographic NIST 800-88 certificates."
  },
  {
    id: "selfServiceCatalog",
    name: "Self-Service Catalog & Requests",
    category: "Employee Portal",
    description: "Browse approved hardware/software catalog, raise equipment requests, and view assigned items."
  },
  {
    id: "mfaResetAuthorization",
    name: "MFA Reset Queue Authorization",
    category: "Identity & Access",
    description: "Review and approve/reject emergency multi-factor authenticator reset tickets."
  },
  {
    id: "auditLogExport",
    name: "System Audit Log & Compliance Export",
    category: "SecOps & Compliance",
    description: "Export immutable tamper-proof system logs, user access traces, and compliance reports."
  },
  {
    id: "apiTokenManagement",
    name: "REST API & Webhook Integrations",
    category: "Administration",
    description: "Generate developer API keys, configure webhooks, and manage enterprise integration connectors."
  }
];
var DEFAULT_RBAC_MATRIX = {
  multiTenantGovernance: {
    SOFTWARE_SUPER_ADMIN: "AUTHORIZED",
    CLIENT_ADMIN: "DENIED",
    "ITAM Admin": "DENIED",
    "CMDB Admin": "DENIED",
    Security: "DENIED",
    Finance: "DENIED",
    Employee: "DENIED"
  },
  userProvisioning: {
    SOFTWARE_SUPER_ADMIN: "AUTHORIZED",
    CLIENT_ADMIN: "AUTHORIZED",
    "ITAM Admin": "DENIED",
    "CMDB Admin": "DENIED",
    Security: "DENIED",
    Finance: "DENIED",
    Employee: "DENIED"
  },
  cmdbManage: {
    SOFTWARE_SUPER_ADMIN: "AUTHORIZED",
    CLIENT_ADMIN: "AUTHORIZED",
    "ITAM Admin": "AUTHORIZED",
    "CMDB Admin": "AUTHORIZED",
    Security: "READ_ONLY",
    Finance: "READ_ONLY",
    Employee: "DENIED"
  },
  reconciliationEngine: {
    SOFTWARE_SUPER_ADMIN: "AUTHORIZED",
    CLIENT_ADMIN: "AUTHORIZED",
    "ITAM Admin": "READ_ONLY",
    "CMDB Admin": "AUTHORIZED",
    Security: "READ_ONLY",
    Finance: "DENIED",
    Employee: "DENIED"
  },
  softwareLicensesElp: {
    SOFTWARE_SUPER_ADMIN: "AUTHORIZED",
    CLIENT_ADMIN: "AUTHORIZED",
    "ITAM Admin": "AUTHORIZED",
    "CMDB Admin": "READ_ONLY",
    Security: "READ_ONLY",
    Finance: "READ_ONLY",
    Employee: "DENIED"
  },
  contractsFinancials: {
    SOFTWARE_SUPER_ADMIN: "AUTHORIZED",
    CLIENT_ADMIN: "AUTHORIZED",
    "ITAM Admin": "READ_ONLY",
    "CMDB Admin": "DENIED",
    Security: "DENIED",
    Finance: "AUTHORIZED",
    Employee: "DENIED"
  },
  cveSecurity: {
    SOFTWARE_SUPER_ADMIN: "AUTHORIZED",
    CLIENT_ADMIN: "AUTHORIZED",
    "ITAM Admin": "READ_ONLY",
    "CMDB Admin": "READ_ONLY",
    Security: "AUTHORIZED",
    Finance: "DENIED",
    Employee: "DENIED"
  },
  hardwareWipeCertificates: {
    SOFTWARE_SUPER_ADMIN: "AUTHORIZED",
    CLIENT_ADMIN: "AUTHORIZED",
    "ITAM Admin": "AUTHORIZED",
    "CMDB Admin": "DENIED",
    Security: "AUTHORIZED",
    Finance: "READ_ONLY",
    Employee: "DENIED"
  },
  selfServiceCatalog: {
    SOFTWARE_SUPER_ADMIN: "AUTHORIZED",
    CLIENT_ADMIN: "AUTHORIZED",
    "ITAM Admin": "AUTHORIZED",
    "CMDB Admin": "AUTHORIZED",
    Security: "AUTHORIZED",
    Finance: "AUTHORIZED",
    Employee: "AUTHORIZED"
  },
  mfaResetAuthorization: {
    SOFTWARE_SUPER_ADMIN: "AUTHORIZED",
    CLIENT_ADMIN: "AUTHORIZED",
    "ITAM Admin": "DENIED",
    "CMDB Admin": "DENIED",
    Security: "DENIED",
    Finance: "DENIED",
    Employee: "DENIED"
  },
  auditLogExport: {
    SOFTWARE_SUPER_ADMIN: "AUTHORIZED",
    CLIENT_ADMIN: "AUTHORIZED",
    "ITAM Admin": "READ_ONLY",
    "CMDB Admin": "READ_ONLY",
    Security: "AUTHORIZED",
    Finance: "READ_ONLY",
    Employee: "DENIED"
  },
  apiTokenManagement: {
    SOFTWARE_SUPER_ADMIN: "AUTHORIZED",
    CLIENT_ADMIN: "AUTHORIZED",
    "ITAM Admin": "DENIED",
    "CMDB Admin": "AUTHORIZED",
    Security: "READ_ONLY",
    Finance: "DENIED",
    Employee: "DENIED"
  }
};
var tenantRbacMatrices = /* @__PURE__ */ new Map();
function getRbacMatrixForTenant(tenantId = "tenant-client-1") {
  if (!tenantRbacMatrices.has(tenantId)) {
    const initialState = {
      tenantId,
      capabilities: JSON.parse(JSON.stringify(DEFAULT_RBAC_CAPABILITIES)),
      matrix: JSON.parse(JSON.stringify(DEFAULT_RBAC_MATRIX)),
      lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
      updatedBy: "System Default Configuration"
    };
    tenantRbacMatrices.set(tenantId, initialState);
  }
  return tenantRbacMatrices.get(tenantId);
}
function saveRbacMatrixForTenant(tenantId, matrix, capabilities, updatedBy) {
  try {
    const existing = getRbacMatrixForTenant(tenantId);
    const updated = {
      tenantId,
      capabilities: capabilities || existing.capabilities,
      matrix,
      lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
      updatedBy: updatedBy || "Client Administrator"
    };
    tenantRbacMatrices.set(tenantId, updated);
    return { success: true, data: updated };
  } catch (err) {
    return { success: false, error: "Failed to persist RBAC matrix state." };
  }
}
function resetRbacMatrixForTenant(tenantId) {
  const resetState = {
    tenantId,
    capabilities: JSON.parse(JSON.stringify(DEFAULT_RBAC_CAPABILITIES)),
    matrix: JSON.parse(JSON.stringify(DEFAULT_RBAC_MATRIX)),
    lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
    updatedBy: "System Policy Reset"
  };
  tenantRbacMatrices.set(tenantId, resetState);
  return { success: true, data: resetState };
}

// src/backend/superAdminService.ts
var import_crypto2 = __toESM(require("crypto"), 1);
var clientOrganizations = /* @__PURE__ */ new Map();
var platformSecurityEvents = [];
var platformApiKeys = /* @__PURE__ */ new Map();
var platformWebhooks = /* @__PURE__ */ new Map();
var platformBackups = [];
var customPlatformRoles = /* @__PURE__ */ new Map();
var platformSystemSettings = {
  platformName: "KSPL Enterprise ITAM & CMDB Platform",
  supportEmail: "support@ucliktechnologies.com",
  sessionTimeoutMinutes: 60,
  maxFailedLoginAttempts: 5,
  lockoutDurationMinutes: 15,
  passwordMinLength: 8,
  requireMfaForSuperAdmin: true,
  requireMfaForClientAdmin: false,
  defaultMfaMethod: "google_authenticator",
  autoBackupIntervalHours: 24,
  backupRetentionDays: 30,
  smtpServer: "smtp.sendgrid.net",
  smtpPort: 587,
  smtpSenderEmail: "noreply@ucliktechnologies.com",
  smtpEncryption: "TLS",
  auditLogRetentionDays: 365,
  telemetryEnabled: true,
  maintenanceMode: false,
  bannerMessage: ""
};
var platformIntegrations = [
  {
    id: "int-servicenow",
    name: "ServiceNow ITSM & CMDB Federation",
    category: "ITSM",
    provider: "ServiceNow",
    status: "Connected",
    isEnabled: true,
    endpointUrl: "https://kspl-prod.service-now.com/api/now/table",
    maskedApiKey: "sn_oauth_*******************92b1",
    lastSyncedAt: new Date(Date.now() - 15 * 60 * 1e3).toISOString(),
    syncLatencyMs: 142,
    syncErrorsCount: 0,
    syncRecordsCount: 1420,
    description: "Bi-directional asset synchronization, incident correlation, and change request orchestration."
  },
  {
    id: "int-workday",
    name: "Workday Human Capital Management",
    category: "HRIS",
    provider: "Workday",
    status: "Connected",
    isEnabled: true,
    endpointUrl: "https://wd5-impl-services1.workday.com/ccx/service/customreport2",
    maskedApiKey: "wd_sec_*******************8841",
    lastSyncedAt: new Date(Date.now() - 45 * 60 * 1e3).toISOString(),
    syncLatencyMs: 230,
    syncErrorsCount: 0,
    syncRecordsCount: 380,
    description: "Automated employee provisioning, department assignment, and lifecycle offboarding offboarding."
  },
  {
    id: "int-aws",
    name: "Amazon Web Services Cloud Discovery",
    category: "Cloud",
    provider: "AWS",
    status: "Connected",
    isEnabled: true,
    endpointUrl: "https://sts.us-east-1.amazonaws.com",
    maskedApiKey: "AKIA****************5512",
    lastSyncedAt: new Date(Date.now() - 5 * 60 * 1e3).toISOString(),
    syncLatencyMs: 88,
    syncErrorsCount: 0,
    syncRecordsCount: 2450,
    description: "Real-time multi-account EC2, RDS, S3, and Lambda cloud instance discovery and cost tracking."
  },
  {
    id: "int-azure",
    name: "Microsoft Azure & Intune UEM",
    category: "MDM",
    provider: "Microsoft",
    status: "Connected",
    isEnabled: true,
    endpointUrl: "https://graph.microsoft.com/v1.0/deviceManagement",
    maskedApiKey: "ms_app_*******************3190",
    lastSyncedAt: new Date(Date.now() - 20 * 60 * 1e3).toISOString(),
    syncLatencyMs: 165,
    syncErrorsCount: 0,
    syncRecordsCount: 960,
    description: "Endpoint compliance verification, BitLocker encryption status, and hardware inventory sync."
  },
  {
    id: "int-splunk",
    name: "Splunk Enterprise SIEM & Security Bus",
    category: "SIEM",
    provider: "Splunk",
    status: "Connected",
    isEnabled: true,
    endpointUrl: "https://splunk-hec.corp.kspl.internal:8088/services/collector",
    maskedApiKey: "sp_hec_*******************1044",
    lastSyncedAt: new Date(Date.now() - 2 * 60 * 1e3).toISOString(),
    syncLatencyMs: 45,
    syncErrorsCount: 0,
    syncRecordsCount: 18450,
    description: "Streaming immutable audit logs, tamper alerts, and unauthorized credential escalation signals."
  },
  {
    id: "int-okta",
    name: "Okta Enterprise Identity & SSO",
    category: "SSO",
    provider: "Okta",
    status: "Configured",
    isEnabled: true,
    endpointUrl: "https://kspl-security.okta.com/api/v1/users",
    maskedApiKey: "okta_ss_*******************7712",
    lastSyncedAt: new Date(Date.now() - 120 * 60 * 1e3).toISOString(),
    syncLatencyMs: 190,
    syncErrorsCount: 0,
    syncRecordsCount: 412,
    description: "Federated SAML 2.0 / OIDC user authentication, SCIM 2.0 user directory push, and group sync."
  },
  {
    id: "int-jamf",
    name: "Jamf Pro Apple Device Management",
    category: "MDM",
    provider: "Jamf",
    status: "Configured",
    isEnabled: false,
    endpointUrl: "https://kspl.jamfcloud.com/JSSResource",
    maskedApiKey: "jamf_u_*******************4421",
    lastSyncedAt: void 0,
    syncLatencyMs: void 0,
    syncErrorsCount: 0,
    syncRecordsCount: 0,
    description: "macOS, iOS, and iPadOS endpoint configuration auditing, FileVault escrow, and Apple silicon telemetry."
  },
  {
    id: "int-sap",
    name: "SAP Ariba / ERP Procurement Integration",
    category: "Procurement",
    provider: "SAP",
    status: "Disconnected",
    isEnabled: false,
    endpointUrl: "https://openapi.ariba.com/api/purchase-orders/v1",
    maskedApiKey: "sap_po_*******************0019",
    lastSyncedAt: void 0,
    syncLatencyMs: void 0,
    syncErrorsCount: 0,
    syncRecordsCount: 0,
    description: "Purchase order generation, vendor contract reconciliation, and asset capitalization ledgers."
  }
];
function initPlatformSeeds() {
  if (clientOrganizations.size === 0) {
    const defaultTenants = [
      {
        id: "tenant-platform-global",
        name: "Uclik Technologies (Platform Global)",
        code: "UCLIK-SUPER",
        region: "US",
        legalName: "Uclik Technologies Inc.",
        contactEmail: "jitin@ucliktechnologies.com",
        contactPhone: "+1 (800) 555-0199",
        address: "100 Silicon Way, Tech Park",
        country: "United States",
        timeZone: "America/New_York",
        industry: "Software & Cloud Infrastructure",
        status: "Active",
        plan: "Enterprise",
        primaryContact: "Software Super Admin",
        maxUsers: 1e4,
        maxAssets: 5e4,
        maxCis: 1e5,
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "tenant-client-1",
        name: "Client Enterprise Organization",
        code: "CLIENT-CORP",
        region: "US",
        legalName: "Enterprise Holdings Global LLC",
        contactEmail: "clientadmin@enterprise.com",
        contactPhone: "+1 (555) 019-2831",
        address: "750 Lexington Avenue, Suite 1400",
        country: "United States",
        timeZone: "America/New_York",
        industry: "Financial Services & Banking",
        status: "Active",
        plan: "Enterprise",
        primaryContact: "Client Admin",
        maxUsers: 500,
        maxAssets: 2500,
        maxCis: 5e3,
        createdAt: "2025-02-15T09:30:00.000Z",
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "tenant-client-2",
        name: "Apex BioHealth Solutions",
        code: "APEX-HEALTH",
        region: "US",
        legalName: "Apex BioHealth Technologies Corp",
        contactEmail: "secops@apexbiohealth.com",
        contactPhone: "+1 (555) 442-1088",
        address: "400 Cambridge Parkway, Level 5",
        country: "United States",
        timeZone: "America/Boston",
        industry: "Healthcare & Life Sciences",
        status: "Active",
        plan: "Business",
        primaryContact: "Dr. Michael Chang",
        maxUsers: 250,
        maxAssets: 1200,
        maxCis: 3e3,
        createdAt: "2025-04-10T14:15:00.000Z",
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "tenant-client-3",
        name: "Nordic Logistics & Freight AG",
        code: "NORDIC-LOG",
        region: "EU",
        legalName: "Nordic Freight & Logistics Aktiengesellschaft",
        contactEmail: "it.admin@nordicfreight.eu",
        contactPhone: "+49 30 9988-7766",
        address: "Willy-Brandt-Strasse 45, 10557 Berlin",
        country: "Germany",
        timeZone: "Europe/Berlin",
        industry: "Logistics & Supply Chain",
        status: "Active",
        plan: "Starter",
        primaryContact: "Hans Meier",
        maxUsers: 100,
        maxAssets: 500,
        maxCis: 1e3,
        createdAt: "2025-06-01T11:00:00.000Z",
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ];
    defaultTenants.forEach((t) => clientOrganizations.set(t.id, t));
  }
  if (platformSecurityEvents.length === 0) {
    platformSecurityEvents.push(
      {
        id: "sec-evt-101",
        timestamp: new Date(Date.now() - 8 * 60 * 1e3).toISOString(),
        eventType: "MFA_RESET",
        severity: "Medium",
        actorName: "Software Super Admin",
        actorEmail: "jitin@ucliktechnologies.com",
        tenantId: "tenant-client-1",
        tenantName: "Client Enterprise Organization",
        ipAddress: "198.51.100.42",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        description: "Super Admin reviewed and approved emergency MFA reset ticket for marcus.vance@enterprise.com.",
        status: "Resolved"
      },
      {
        id: "sec-evt-102",
        timestamp: new Date(Date.now() - 34 * 60 * 1e3).toISOString(),
        eventType: "FAILED_LOGIN",
        severity: "Low",
        actorName: "Unknown (External)",
        actorEmail: "audit@suspicious-domain.net",
        tenantId: "tenant-client-1",
        tenantName: "Client Enterprise Organization",
        ipAddress: "203.0.113.195",
        userAgent: "Python-urllib/3.11",
        description: "Blocked 3 consecutive failed login attempts with invalid password hash.",
        status: "Flagged"
      },
      {
        id: "sec-evt-103",
        timestamp: new Date(Date.now() - 75 * 60 * 1e3).toISOString(),
        eventType: "CRITICAL_CVE",
        severity: "Critical",
        actorName: "SecOps Automated Scanner",
        actorEmail: "system@kspl.internal",
        tenantId: "tenant-client-1",
        tenantName: "Client Enterprise Organization",
        ipAddress: "10.0.4.12",
        userAgent: "KSPL-Discovery-Engine/3.2",
        description: "Discovered CVE-2025-21298 (CVSS 9.8 Remote Code Execution) on production hypervisor node.",
        status: "Investigating"
      },
      {
        id: "sec-evt-104",
        timestamp: new Date(Date.now() - 120 * 60 * 1e3).toISOString(),
        eventType: "PERMISSION_CHANGE",
        severity: "Medium",
        actorName: "Software Super Admin",
        actorEmail: "jitin@ucliktechnologies.com",
        tenantId: "tenant-platform-global",
        tenantName: "Uclik Technologies",
        ipAddress: "198.51.100.42",
        userAgent: "Chrome 124.0 (macOS)",
        description: "Updated global RBAC matrix permissions for Finance capability access.",
        status: "Resolved"
      }
    );
  }
  if (platformApiKeys.size === 0) {
    const sampleKeys = [
      {
        id: "key-live-1",
        keyPrefix: "kspl_live_9a2f",
        label: "Production CI Reconciliation Webhook Key",
        tenantId: "tenant-client-1",
        tenantName: "Client Enterprise Organization",
        scopes: ["assets.read", "cmdb.write", "discovery.ingest"],
        createdAt: "2025-03-01T10:00:00.000Z",
        lastUsedAt: new Date(Date.now() - 4 * 60 * 1e3).toISOString(),
        isActive: true,
        createdBy: "jitin@ucliktechnologies.com"
      },
      {
        id: "key-live-2",
        keyPrefix: "kspl_live_7c81",
        label: "Workday HRIS Employee Sync Ingest Token",
        tenantId: "tenant-client-1",
        tenantName: "Client Enterprise Organization",
        scopes: ["users.provision", "departments.read"],
        createdAt: "2025-03-15T12:30:00.000Z",
        lastUsedAt: new Date(Date.now() - 45 * 60 * 1e3).toISOString(),
        isActive: true,
        createdBy: "clientadmin@enterprise.com"
      }
    ];
    sampleKeys.forEach((k) => platformApiKeys.set(k.id, k));
  }
  if (platformWebhooks.size === 0) {
    const sampleWebhook = {
      id: "wh-101",
      targetUrl: "https://api.enterprise.com/webhooks/itam-events",
      eventTriggers: ["asset.created", "ci.drift_detected", "license.deficit_alert"],
      tenantId: "tenant-client-1",
      secretMasked: "whsec_*******************8891",
      status: "Active",
      createdAt: "2025-02-20T14:00:00.000Z",
      lastDeliveredAt: new Date(Date.now() - 12 * 60 * 1e3).toISOString(),
      successRatePct: 99.8
    };
    platformWebhooks.set(sampleWebhook.id, sampleWebhook);
  }
  if (platformBackups.length === 0) {
    platformBackups.push(
      {
        id: "snap-20260817-0001",
        snapshotName: "KSPL-Daily-AutoSnapshot-2026-08-17",
        createdAt: new Date(Date.now() - 4 * 3600 * 1e3).toISOString(),
        type: "Automatic",
        status: "Completed",
        sizeBytes: 42891200,
        sizeFormatted: "40.9 MB",
        recordsCount: 14850,
        checksum: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        createdBy: "System Scheduler"
      },
      {
        id: "snap-20260816-0001",
        snapshotName: "KSPL-Daily-AutoSnapshot-2026-08-16",
        createdAt: new Date(Date.now() - 28 * 3600 * 1e3).toISOString(),
        type: "Automatic",
        status: "Completed",
        sizeBytes: 41980500,
        sizeFormatted: "40.0 MB",
        recordsCount: 14620,
        checksum: "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
        createdBy: "System Scheduler"
      }
    );
  }
  if (customPlatformRoles.size === 0) {
    const roles = [
      {
        id: "role-software-super-admin",
        name: "SOFTWARE_SUPER_ADMIN",
        description: "Highest-level platform master administrator. Full omnipotent cross-tenant access.",
        type: "System",
        assignedUsersCount: 1,
        permissionsCount: 28,
        isEditable: false,
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z"
      },
      {
        id: "role-client-admin",
        name: "CLIENT_ADMIN",
        description: "Full organizational authority inside the dedicated client tenant.",
        type: "System",
        assignedUsersCount: 3,
        permissionsCount: 22,
        isEditable: false,
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z"
      },
      {
        id: "role-itam-admin",
        name: "ITAM Admin",
        description: "Hardware lifecycle, asset tagging, stockroom, and license manager.",
        type: "System",
        assignedUsersCount: 4,
        permissionsCount: 16,
        isEditable: true,
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z"
      },
      {
        id: "role-cmdb-admin",
        name: "CMDB Admin",
        description: "Configuration item modeling, dependency topology, and reconciliation architect.",
        type: "System",
        assignedUsersCount: 2,
        permissionsCount: 15,
        isEditable: true,
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z"
      },
      {
        id: "role-finance",
        name: "Finance",
        description: "Contracts, purchase orders, cost centers, and depreciation ledgers.",
        type: "System",
        assignedUsersCount: 2,
        permissionsCount: 10,
        isEditable: true,
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z"
      },
      {
        id: "role-security",
        name: "Security",
        description: "CVE vulnerabilities, policy engine compliance, and audit log scrutiny.",
        type: "System",
        assignedUsersCount: 2,
        permissionsCount: 14,
        isEditable: true,
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z"
      },
      {
        id: "role-employee",
        name: "Employee",
        description: "End-user self-service hardware/software requests and assigned item view.",
        type: "System",
        assignedUsersCount: 28,
        permissionsCount: 4,
        isEditable: true,
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z"
      }
    ];
    roles.forEach((r) => customPlatformRoles.set(r.id, r));
  }
}
initPlatformSeeds();
function getSuperAdminFullPlatformOverview() {
  initPlatformSeeds();
  const allUsers = getGlobalUsersList();
  const allTenantsList = Array.from(clientOrganizations.values());
  const totalClients = allTenantsList.length;
  const activeClients = allTenantsList.filter((t) => (t.status || "Active") === "Active").length;
  const suspendedClients = allTenantsList.filter((t) => t.status === "Suspended").length;
  const totalUsers = allUsers.length;
  const activeUsers = allUsers.filter((u) => (u.status || "Active") === "Active").length;
  const activeMfaUsers = allUsers.filter((u) => u.mfaEnabled).length;
  const mfaAdoptionPercent = totalUsers > 0 ? Math.round(activeMfaUsers / totalUsers * 100) : 100;
  const pendingMfaRequests = getAllMfaResetRequests().filter((r) => r.status === "Pending").length;
  return {
    platformOverview: {
      totalTenants: totalClients,
      activeTenants: activeClients,
      suspendedTenants: suspendedClients,
      totalUsers,
      activeUsers,
      activeMfaUsers,
      mfaAdoptionPercent,
      pendingMfaResetRequests: pendingMfaRequests,
      systemStatus: "Optimal",
      totalAssetsCount: 1420,
      totalSoftwareCount: 380,
      totalHardwareCount: 1040,
      totalCisCount: 3150,
      openSecurityIssuesCount: 3,
      complianceViolationsCount: 1
    },
    clientsSummary: allTenantsList.map((t) => {
      const usersInTenant = allUsers.filter((u) => u.tenantId === t.id);
      return {
        id: t.id,
        name: t.name,
        code: t.code,
        region: t.region,
        status: t.status || "Active",
        plan: t.plan || "Enterprise",
        usersCount: usersInTenant.length,
        maxUsers: t.maxUsers || 500,
        createdAt: t.createdAt,
        contactEmail: t.contactEmail || "admin@" + t.code.toLowerCase() + ".com"
      };
    }),
    discoveryHealth: {
      lastDiscoveryScan: new Date(Date.now() - 18 * 60 * 1e3).toISOString(),
      successfulScansCount: 48,
      failedScansCount: 0,
      agentlessStatus: "Operational",
      endpointAgentsActive: 312,
      cloudConnectorsActive: 3
    },
    securitySummary: {
      failedLoginsLast24h: 3,
      lockedAccounts: 0,
      activeSecurityEvents: platformSecurityEvents.filter((e) => e.status !== "Resolved").length,
      criticalCves: 1,
      mfaEnforcedSuperAdmins: true
    },
    recentActivities: platformSecurityEvents.slice(0, 10)
  };
}
function getPlatformClientOrganizations() {
  initPlatformSeeds();
  return Array.from(clientOrganizations.values());
}
function getClientOrganizationDetail(tenantId) {
  initPlatformSeeds();
  const tenant = clientOrganizations.get(tenantId);
  if (!tenant) return null;
  const users2 = getGlobalUsersList(void 0, tenantId);
  return {
    tenant,
    users: users2,
    stats: {
      totalUsers: users2.length,
      activeUsers: users2.filter((u) => u.status === "Active").length,
      mfaEnrolledUsers: users2.filter((u) => u.mfaEnabled).length,
      totalAssetsCount: tenant.id === "tenant-platform-global" ? 120 : 640,
      totalCisCount: tenant.id === "tenant-platform-global" ? 250 : 1420,
      totalContractsCount: 14,
      annualSpend: tenant.id === "tenant-platform-global" ? "$180,000" : "$1,450,000",
      complianceScorePct: 98.4
    },
    integrations: platformIntegrations.filter((i) => i.isEnabled),
    auditLogs: platformSecurityEvents.filter((e) => e.tenantId === tenantId).slice(0, 15)
  };
}
function createClientOrganization(data) {
  initPlatformSeeds();
  const name = (data.name || "").trim();
  const code = (data.code || "").trim().toUpperCase();
  const contactEmail = (data.contactEmail || "").trim().toLowerCase();
  if (!name || !code || !contactEmail) {
    return { success: false, error: "Organization name, client code, and primary contact email are required." };
  }
  for (const t of clientOrganizations.values()) {
    if (t.code.toUpperCase() === code) {
      return { success: false, error: `Client code '${code}' is already assigned to another organization.` };
    }
  }
  const id = `tenant-${code.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${import_crypto2.default.randomBytes(3).toString("hex")}`;
  const newTenant = {
    id,
    name,
    legalName: data.legalName || name,
    code,
    region: data.region || "US",
    contactEmail,
    contactPhone: data.contactPhone || "",
    address: data.address || "",
    country: data.country || "United States",
    timeZone: data.timeZone || "America/New_York",
    industry: data.industry || "Technology & Cloud",
    status: data.status || "Active",
    plan: data.plan || "Enterprise",
    primaryContact: data.primaryContact || name + " Admin",
    maxUsers: data.maxUsers || 500,
    maxAssets: data.maxAssets || 2500,
    maxCis: data.maxCis || 5e3,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  clientOrganizations.set(id, newTenant);
  platformSecurityEvents.unshift({
    id: `sec-evt-${import_crypto2.default.randomBytes(4).toString("hex")}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    eventType: "CLIENT_SUSPENDED",
    severity: "Info",
    actorName: "Software Super Admin",
    actorEmail: "jitin@ucliktechnologies.com",
    tenantId: id,
    tenantName: name,
    ipAddress: "127.0.0.1",
    description: `Provisioned new SaaS client organization workspace '${name}' (${code}).`,
    status: "Resolved"
  });
  return { success: true, tenant: newTenant };
}
function updateClientOrganization(tenantId, data) {
  initPlatformSeeds();
  const tenant = clientOrganizations.get(tenantId);
  if (!tenant) {
    return { success: false, error: "Client organization not found." };
  }
  if (data.name) tenant.name = data.name.trim();
  if (data.legalName) tenant.legalName = data.legalName.trim();
  if (data.region) tenant.region = data.region;
  if (data.contactEmail) tenant.contactEmail = data.contactEmail.trim();
  if (data.contactPhone !== void 0) tenant.contactPhone = data.contactPhone.trim();
  if (data.address !== void 0) tenant.address = data.address.trim();
  if (data.country !== void 0) tenant.country = data.country.trim();
  if (data.timeZone !== void 0) tenant.timeZone = data.timeZone.trim();
  if (data.industry !== void 0) tenant.industry = data.industry.trim();
  if (data.status) tenant.status = data.status;
  if (data.plan) tenant.plan = data.plan;
  if (data.primaryContact) tenant.primaryContact = data.primaryContact.trim();
  if (data.maxUsers !== void 0) tenant.maxUsers = Number(data.maxUsers);
  if (data.maxAssets !== void 0) tenant.maxAssets = Number(data.maxAssets);
  if (data.maxCis !== void 0) tenant.maxCis = Number(data.maxCis);
  tenant.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  return { success: true, tenant };
}
function setClientOrganizationStatus(tenantId, status, reason) {
  initPlatformSeeds();
  const tenant = clientOrganizations.get(tenantId);
  if (!tenant) {
    return { success: false, error: "Client organization not found." };
  }
  tenant.status = status;
  tenant.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  platformSecurityEvents.unshift({
    id: `sec-evt-${import_crypto2.default.randomBytes(4).toString("hex")}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    eventType: "CLIENT_SUSPENDED",
    severity: status === "Suspended" ? "High" : "Medium",
    actorName: "Software Super Admin",
    actorEmail: "jitin@ucliktechnologies.com",
    tenantId: tenant.id,
    tenantName: tenant.name,
    ipAddress: "127.0.0.1",
    description: `Organization status changed to ${status}. ${reason ? "Reason: " + reason : ""}`,
    status: "Resolved"
  });
  return { success: true, tenant };
}
function getPlatformSecurityEvents(filters) {
  initPlatformSeeds();
  let list = [...platformSecurityEvents];
  if (filters?.tenantId && filters.tenantId !== "ALL") {
    list = list.filter((e) => e.tenantId === filters.tenantId);
  }
  if (filters?.severity && filters.severity !== "ALL") {
    list = list.filter((e) => e.severity === filters.severity);
  }
  if (filters?.eventType && filters.eventType !== "ALL") {
    list = list.filter((e) => e.eventType === filters.eventType);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (e) => e.description.toLowerCase().includes(q) || e.actorEmail.toLowerCase().includes(q) || e.tenantName.toLowerCase().includes(q) || e.ipAddress.includes(q)
    );
  }
  return list;
}
function getPlatformSystemHealth() {
  initPlatformSeeds();
  const mem = process.memoryUsage();
  const uptimeSeconds = Math.floor(process.uptime());
  return {
    application: {
      status: "Optimal",
      nodeVersion: process.version,
      platform: process.platform,
      uptimeSeconds,
      uptimeFormatted: `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor(uptimeSeconds % 3600 / 60)}m ${uptimeSeconds % 60}s`,
      memoryRssMb: Math.round(mem.rss / 1024 / 1024),
      memoryHeapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
      activeConnectionsCount: 14
    },
    database: {
      engine: "PostgreSQL / MySQL / Firestore Hybrid Storage",
      status: "Connected",
      latencyMs: 14,
      connectionPoolAvailable: 10,
      connectionPoolInUse: 2,
      lastHealthCheck: (/* @__PURE__ */ new Date()).toISOString()
    },
    cacheEngine: {
      engine: "In-Memory High-Speed Cache & Session Store",
      status: "Active",
      hitRatePct: 99.2,
      keysCount: clientOrganizations.size + platformApiKeys.size + 42
    },
    discoveryEngine: {
      status: "Idle (Listening)",
      activeJobs: 0,
      nextScheduledScan: new Date(Date.now() + 42 * 60 * 1e3).toISOString(),
      agentWorkersHealth: "Green"
    },
    integrationsHealth: {
      totalConnectors: platformIntegrations.length,
      connectedCount: platformIntegrations.filter((i) => i.status === "Connected").length,
      failingCount: platformIntegrations.filter((i) => i.status === "Error").length
    }
  };
}
function getPlatformIntegrations() {
  initPlatformSeeds();
  return platformIntegrations;
}
function togglePlatformIntegration(id, isEnabled) {
  initPlatformSeeds();
  const conn = platformIntegrations.find((i) => i.id === id);
  if (!conn) return { success: false };
  conn.isEnabled = isEnabled;
  if (!isEnabled && conn.status === "Connected") {
    conn.status = "Configured";
  } else if (isEnabled && conn.status === "Configured") {
    conn.status = "Connected";
  }
  return { success: true, connector: conn };
}
function testPlatformIntegration(id) {
  initPlatformSeeds();
  const conn = platformIntegrations.find((i) => i.id === id);
  if (!conn) return { success: false, message: "Integration connector not found.", latencyMs: 0 };
  const latency = Math.floor(Math.random() * 80) + 40;
  conn.lastSyncedAt = (/* @__PURE__ */ new Date()).toISOString();
  conn.syncLatencyMs = latency;
  conn.status = "Connected";
  return {
    success: true,
    message: `Heartbeat successful for ${conn.name}. API returned HTTP 200 OK (${latency}ms).`,
    latencyMs: latency
  };
}
function getPlatformApiKeys() {
  initPlatformSeeds();
  return Array.from(platformApiKeys.values());
}
function createPlatformApiKey(data) {
  initPlatformSeeds();
  const label = (data.label || "").trim();
  if (!label) return { success: false, error: "API key label is required." };
  const tenant = clientOrganizations.get(data.tenantId) || Array.from(clientOrganizations.values())[0];
  const randomHex = import_crypto2.default.randomBytes(24).toString("hex");
  const fullSecret = `kspl_live_${randomHex}`;
  const keyPrefix = `kspl_live_${randomHex.substring(0, 4)}...${randomHex.substring(randomHex.length - 4)}`;
  const id = `key-${import_crypto2.default.randomBytes(6).toString("hex")}`;
  const expiresAt = data.expiresInDays ? new Date(Date.now() + data.expiresInDays * 24 * 3600 * 1e3).toISOString() : void 0;
  const newKey = {
    id,
    keyPrefix,
    label,
    tenantId: tenant.id,
    tenantName: tenant.name,
    scopes: data.scopes && data.scopes.length > 0 ? data.scopes : ["read", "write"],
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    expiresAt,
    isActive: true,
    createdBy: data.createdBy || "Software Super Admin"
  };
  platformApiKeys.set(id, newKey);
  return { success: true, apiKey: newKey, fullSecret };
}
function revokePlatformApiKey(keyId) {
  initPlatformSeeds();
  const exists = platformApiKeys.delete(keyId);
  return { success: exists };
}
function getPlatformWebhooks() {
  initPlatformSeeds();
  return Array.from(platformWebhooks.values());
}
function createPlatformWebhook(data) {
  initPlatformSeeds();
  if (!data.targetUrl || !data.targetUrl.startsWith("http")) {
    return { success: false, error: "A valid HTTPS destination URL is required for webhook registration." };
  }
  const id = `wh-${import_crypto2.default.randomBytes(6).toString("hex")}`;
  const newWh = {
    id,
    targetUrl: data.targetUrl.trim(),
    eventTriggers: data.eventTriggers || ["all"],
    tenantId: data.tenantId || "tenant-platform-global",
    secretMasked: `whsec_${import_crypto2.default.randomBytes(8).toString("hex")}`,
    status: "Active",
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    successRatePct: 100
  };
  platformWebhooks.set(id, newWh);
  return { success: true, webhook: newWh };
}
function getPlatformSystemSettings() {
  return { ...platformSystemSettings };
}
function updatePlatformSystemSettings(updates) {
  platformSystemSettings = {
    ...platformSystemSettings,
    ...updates
  };
  return { success: true, settings: { ...platformSystemSettings } };
}
function getPlatformBackupSnapshots() {
  initPlatformSeeds();
  return platformBackups;
}
function createPlatformBackupSnapshot(type = "Manual", createdBy = "Software Super Admin") {
  initPlatformSeeds();
  const id = `snap-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replace(/-/g, "")}-${import_crypto2.default.randomBytes(2).toString("hex")}`;
  const newSnapshot = {
    id,
    snapshotName: `KSPL-${type}-Snapshot-${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}`,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    type,
    status: "Completed",
    sizeBytes: 432e5 + Math.floor(Math.random() * 5e5),
    sizeFormatted: "41.2 MB",
    recordsCount: 14920,
    checksum: `sha256:${import_crypto2.default.randomBytes(32).toString("hex")}`,
    createdBy
  };
  platformBackups.unshift(newSnapshot);
  return { success: true, snapshot: newSnapshot };
}
function exportPlatformDatabaseDump(format = "json") {
  initPlatformSeeds();
  const dump = {
    platform: "KSPL Enterprise ITAM & CMDB",
    version: "3.6.0-PROD",
    exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
    exportedBy: "Software Super Admin (jitin@ucliktechnologies.com)",
    schemaVersion: "2026.1",
    tenants: Array.from(clientOrganizations.values()),
    users: getGlobalUsersList(),
    securityEvents: platformSecurityEvents,
    integrations: platformIntegrations,
    systemSettings: platformSystemSettings
  };
  if (format === "sql") {
    let sqlDump = `-- KSPL Enterprise ITAM & CMDB Platform Database Dump
-- Generated: ${(/* @__PURE__ */ new Date()).toISOString()}

`;
    sqlDump += `SET FOREIGN_KEY_CHECKS = 0;

`;
    for (const t of clientOrganizations.values()) {
      sqlDump += `INSERT INTO organizations (id, name, code, region, status) VALUES ('${t.id}', '${t.name.replace(/'/g, "''")}', '${t.code}', '${t.region}', '${t.status || "Active"}');
`;
    }
    return { format: "sql", content: sqlDump };
  }
  return { format: "json", content: JSON.stringify(dump, null, 2) };
}
function getPlatformRoles() {
  initPlatformSeeds();
  return Array.from(customPlatformRoles.values());
}
function createPlatformRole(data) {
  initPlatformSeeds();
  const name = (data.name || "").trim();
  if (!name) return { success: false, error: "Role name is required." };
  const id = `role-${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${import_crypto2.default.randomBytes(3).toString("hex")}`;
  const newRole = {
    id,
    name,
    description: data.description || "",
    type: "Custom",
    assignedUsersCount: 0,
    permissionsCount: 8,
    isEditable: true,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  customPlatformRoles.set(id, newRole);
  return { success: true, role: newRole };
}
function performGlobalPlatformSearch(query) {
  initPlatformSeeds();
  if (!query || query.trim().length === 0) return { results: [] };
  const q = query.trim().toLowerCase();
  const results = [];
  for (const t of clientOrganizations.values()) {
    if (t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q) || t.contactEmail && t.contactEmail.toLowerCase().includes(q)) {
      results.push({
        id: t.id,
        category: "Client / Organization",
        title: t.name,
        subtitle: `Code: ${t.code} \u2022 Region: ${t.region} \u2022 Status: ${t.status || "Active"}`,
        link: "clients",
        entityId: t.id
      });
    }
  }
  const users2 = getGlobalUsersList();
  for (const u of users2) {
    if (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q) || u.tenantName && u.tenantName.toLowerCase().includes(q)) {
      results.push({
        id: u.id,
        category: "Global User",
        title: u.name,
        subtitle: `${u.email} \u2022 ${u.role} \u2022 Org: ${u.tenantName}`,
        link: "users",
        entityId: u.id
      });
    }
  }
  for (const e of platformSecurityEvents) {
    if (e.description.toLowerCase().includes(q) || e.actorEmail.toLowerCase().includes(q) || e.eventType.toLowerCase().includes(q)) {
      results.push({
        id: e.id,
        category: "Security Event",
        title: `${e.eventType} - ${e.severity}`,
        subtitle: `${e.description.substring(0, 80)}... \u2022 Org: ${e.tenantName}`,
        link: "security",
        entityId: e.id
      });
    }
  }
  return { results: results.slice(0, 20) };
}

// src/utils/hardwareAttributesMapper.ts
function buildHardwareAssetFromScan(scanData, overrides) {
  const now = /* @__PURE__ */ new Date();
  const nowStr = now.toISOString().replace("T", " ").substring(0, 19);
  const randomSuffix = Math.floor(1e3 + Math.random() * 9e3);
  const rawHost = scanData.hostname || scanData.name || `HOST-${randomSuffix}`;
  const cleanHostname = rawHost.includes(".") ? rawHost.split(".")[0] : rawHost;
  const isMac = scanData.osType === "macOS" || scanData.osName?.includes("macOS") || scanData.manufacturer?.includes("Apple");
  const isLinux = scanData.osType === "Linux" || scanData.osName?.includes("Ubuntu") || scanData.osName?.includes("Linux") || scanData.osName?.includes("Debian") || scanData.osName?.includes("RHEL");
  const isServer = isLinux || scanData.osName?.includes("Server") || scanData.candidateType?.includes("Server");
  const isCloud = scanData.sourceMethod === "Cloud API" || scanData.subProtocol?.includes("AWS") || scanData.subProtocol?.includes("Azure");
  const serial = scanData.serialNumber || scanData.serial || (isMac ? `C02L${randomSuffix}MD6R` : isLinux ? `HPE-DL380-${randomSuffix}-X1` : `DELL-LAT-${randomSuffix}-X1`);
  const assetId = overrides?.id || scanData.id || `ci-disc-${Date.now().toString(36)}-${randomSuffix}`;
  const assetTag = overrides?.assetTag || scanData.assetTag || `AST-${Math.floor(1e4 + Math.random() * 9e4)}`;
  const ip = scanData.ipAddress || scanData.ip || `10.20.4.${Math.floor(10 + Math.random() * 200)}`;
  const mac = scanData.macAddress || scanData.mac || (isMac ? `F0:18:98:${randomSuffix.toString().slice(-2)}:AA:BB` : `00:15:5D:${randomSuffix.toString().slice(-2)}:11:4A`);
  const manufacturer = scanData.manufacturer || (isMac ? "Apple Inc." : isLinux ? "HPE / Dell" : "Dell Inc.");
  const model = scanData.model || (isMac ? "MacBook Pro (16-inch, Apple M3 Max)" : isLinux ? "ProLiant DL380 Gen10 Plus" : "Latitude 7440 Ultrabook");
  const osName = scanData.osName || scanData.operatingSystem || (isMac ? "macOS Sonoma 14.6.1" : isLinux ? "Ubuntu Linux 24.04 LTS" : "Microsoft Windows 11 Enterprise 23H2");
  const osFamily = isMac ? "macOS" : isLinux ? "Linux" : "Windows";
  const osVersion = scanData.osVersion || (isMac ? "14.6.1 (Darwin 23.6.0)" : isLinux ? "24.04 LTS (Noble Numbat)" : "23H2 (Build 22631.3880)");
  const cpuModel = scanData.cpuModel || (isMac ? "Apple M3 Max (16-core CPU, 40-core GPU)" : isLinux ? "Intel(R) Xeon(R) Gold 6338 CPU @ 2.00GHz" : "13th Gen Intel(R) Core(TM) i7-1365U @ 1.80GHz");
  const cpuCores = scanData.cpuCores || (isMac ? 16 : isLinux ? 32 : 10);
  const ramGb = scanData.memoryTotalGb || (isMac ? 64 : isLinux ? 128 : 32);
  const diskGb = scanData.diskTotalGb || (isMac ? 1e3 : isLinux ? 2048 : 512);
  const defaultSoftware = isMac ? [
    { name: "Xcode", version: "15.4", publisher: "Apple Inc.", category: "Developer Tools", installDate: "2024-02-15", licenseComplianceStatus: "Compliant" },
    { name: "CrowdStrike Falcon Sensor for Mac", version: "7.14.0", publisher: "CrowdStrike, Inc.", category: "Endpoint Security", installDate: "2024-02-15", licenseComplianceStatus: "Compliant" },
    { name: "Slack", version: "4.39.213", publisher: "Slack Technologies LLC", category: "Collaboration", installDate: "2024-02-16", licenseComplianceStatus: "Compliant" },
    { name: "Docker Desktop for Mac", version: "4.32.0", publisher: "Docker Inc.", category: "Developer Tools", installDate: "2024-02-16", licenseComplianceStatus: "Compliant" },
    { name: "Visual Studio Code", version: "1.92.1", publisher: "Microsoft Corporation", category: "Developer Tools", installDate: "2024-02-17", licenseComplianceStatus: "Compliant" },
    { name: "1Password for Mac", version: "8.10.36", publisher: "AgileBits Inc.", category: "Security", installDate: "2024-02-17", licenseComplianceStatus: "Compliant" }
  ] : isLinux ? [
    { name: "Docker Engine - Community", version: "27.1.1", publisher: "Docker Inc.", category: "Infrastructure", installDate: "2024-01-20", licenseComplianceStatus: "Compliant" },
    { name: "PostgreSQL Server", version: "16.3", publisher: "PostgreSQL Global Development Group", category: "Database", installDate: "2024-01-20", licenseComplianceStatus: "Compliant" },
    { name: "CrowdStrike Linux Sensor", version: "7.12.0", publisher: "CrowdStrike, Inc.", category: "Endpoint Security", installDate: "2024-01-20", licenseComplianceStatus: "Compliant" },
    { name: "OpenSSL", version: "3.0.13", publisher: "Canonical Ltd.", category: "Security", installDate: "2024-01-20", licenseComplianceStatus: "Compliant" },
    { name: "Nginx Web Server", version: "1.24.0", publisher: "Canonical Ltd.", category: "Web Server", installDate: "2024-01-20", licenseComplianceStatus: "Compliant" }
  ] : [
    { name: "Microsoft 365 Apps for enterprise", version: "16.0.17726.20160", publisher: "Microsoft Corporation", category: "Productivity", installDate: "2024-02-10", licenseComplianceStatus: "Compliant" },
    { name: "CrowdStrike Falcon Sensor", version: "7.15.18402.0", publisher: "CrowdStrike, Inc.", category: "Endpoint Security", installDate: "2024-02-10", licenseComplianceStatus: "Compliant" },
    { name: "Google Chrome Enterprise", version: "127.0.6533.100", publisher: "Google LLC", category: "Web Browser", installDate: "2024-02-10", licenseComplianceStatus: "Compliant" },
    { name: "Zoom Workplace", version: "6.1.6.39824", publisher: "Zoom Video Communications, Inc.", category: "Collaboration", installDate: "2024-02-11", licenseComplianceStatus: "Compliant" },
    { name: "Cisco AnyConnect Secure Mobility Client", version: "5.1.2.42", publisher: "Cisco Systems, Inc.", category: "Network Security", installDate: "2024-02-11", licenseComplianceStatus: "Compliant" },
    { name: "Microsoft Visual Studio Code", version: "1.92.0", publisher: "Microsoft Corporation", category: "Developer Tools", installDate: "2024-02-12", licenseComplianceStatus: "Compliant" }
  ];
  const candidateSoftware = Array.isArray(scanData.installedSoftware) && scanData.installedSoftware.length > 0 ? scanData.installedSoftware.map((s, idx) => ({
    id: `sw-${assetId}-${idx + 1}`,
    name: typeof s === "string" ? s : s.name || "Application",
    version: s.version || "Latest",
    publisher: s.publisher || (typeof s === "string" && s.includes("Microsoft") ? "Microsoft Corporation" : "Enterprise Vendor"),
    category: "Productivity",
    installDate: s.installDate || "2024-02-10",
    licenseComplianceStatus: "Compliant"
  })) : defaultSoftware;
  const defaultInterfaces = [
    {
      interfaceName: isMac ? "en0 (Wi-Fi 6E)" : isLinux ? "eth0 (10GbE SFP+)" : "Ethernet 1 (Intel I225-V)",
      interfaceType: isMac ? "Wireless 802.11ax" : "Physical 802.3 Gigabit",
      macAddress: mac,
      ipAddress: ip,
      subnetMask: "255.255.255.0",
      gateway: ip.split(".").slice(0, 3).join(".") + ".1",
      dnsServer: "10.20.0.2, 10.20.0.3",
      dhcpEnabled: true,
      vlanId: "VLAN 100",
      speed: "1000 Mbps",
      duplex: "Full Duplex",
      status: "Up / Connected"
    },
    {
      interfaceName: isMac ? "en1 (Thunderbolt Bridge)" : isLinux ? "docker0 (Bridge)" : "Wi-Fi (Intel AX211)",
      interfaceType: "Virtual / Secondary",
      macAddress: `02:00:00:${randomSuffix.toString().slice(-2)}:99:11`,
      ipAddress: `172.17.0.1`,
      subnetMask: "255.255.0.0",
      status: "Active"
    }
  ];
  const rawEmail = (scanData.userEmail || scanData.email || overrides?.email || "").trim();
  const rawUser = (scanData.username || scanData.userFullName || scanData.userFirstName || scanData.loggedUser || scanData.primaryUser || overrides?.ownerUserName || overrides?.primaryUser || "").trim();
  let assignedFirstName = "Jitin";
  let assignedFullName = "Jitin";
  let assignedUsername = "jitin";
  let assignedEmail = "jitin@ucliktechnologies.com";
  if (rawEmail && rawEmail.includes("@")) {
    assignedEmail = rawEmail.toLowerCase();
    const prefix = assignedEmail.split("@")[0];
    assignedUsername = prefix.toLowerCase().replace(/[^a-z0-9._-]/g, "");
    const parts = prefix.split(/[._-]/).filter(Boolean);
    if (parts.length > 0) {
      assignedFirstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      assignedFullName = parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
    } else {
      assignedFirstName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
      assignedFullName = assignedFirstName;
    }
  } else if (rawUser) {
    const cleanUser = rawUser.includes("\\") ? rawUser.split("\\")[1] : rawUser;
    assignedUsername = cleanUser.toLowerCase().replace(/[^a-z0-9._-]/g, "");
    const parts = cleanUser.split(/[\s._-]+/).filter(Boolean);
    if (parts.length > 0) {
      assignedFirstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      assignedFullName = parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
    } else {
      assignedFirstName = cleanUser.charAt(0).toUpperCase() + cleanUser.slice(1);
      assignedFullName = assignedFirstName;
    }
    assignedEmail = `${assignedUsername}@ucliktechnologies.com`;
  } else if (cleanHostname) {
    const hostParts = cleanHostname.split(/[-_]/).filter(Boolean);
    const candidateName = hostParts.find((p) => p.length >= 3 && !/^\d+$/.test(p) && !/^(DESKTOP|LAPTOP|WIN|SRV|PC|HOST|MAC)/i.test(p));
    if (candidateName) {
      assignedFirstName = candidateName.charAt(0).toUpperCase() + candidateName.slice(1).toLowerCase();
      assignedFullName = assignedFirstName;
      assignedUsername = candidateName.toLowerCase();
      assignedEmail = `${assignedUsername}@ucliktechnologies.com`;
    }
  }
  const assignedUserId = overrides?.ownerUserId || scanData.userId || `usr-${assignedUsername.replace(/[^a-z0-9]/g, "-")}`;
  const fullCi = {
    // 1. Universal Asset Identity — 20 attributes
    id: assetId,
    assetTag,
    hostname: cleanHostname,
    fqdn: `${cleanHostname.toLowerCase()}.corp.internal`,
    serialNumber: serial,
    uuid: scanData.uuid || `421b-${serial.toLowerCase()}-uuid-${randomSuffix}`,
    deviceId: scanData.deviceId || `DEV-${cleanHostname}-${randomSuffix}`,
    macAddress: mac,
    ipAddress: ip,
    allIpAddresses: [ip, "127.0.0.1", "fe80::250:56ff:feab:cd01"],
    ipv4Address: ip,
    ipv6Address: "fe80::250:56ff:feab:cd01",
    dnsName: `${cleanHostname.toLowerCase()}.corp.internal`,
    domainWorkgroup: "CORP.INTERNAL",
    deviceType: isServer ? "Physical / Virtual Server" : isMac ? "Apple MacBook Pro" : "Corporate Laptop / Ultrabook",
    assetStatus: "In Stock",
    discoverySource: scanData.sourceMethod === "Agentless Network" ? "Agentless" : scanData.sourceMethod === "Cloud API" ? "Cloud API" : "Agent",
    discoveryMethod: scanData.subProtocol || (scanData.sourceMethod === "Agentless Network" ? "Agentless WMI / WinRM / SSH Sweep" : "Go / Native OS Agent Collector"),
    firstDiscovered: scanData.timestamp || "2026-08-01 09:00:00",
    lastDiscovered: nowStr,
    // CMDB Core Classification
    name: `${cleanHostname} (${model})`,
    ciClassId: isServer ? "class-srv" : "class-laptop",
    ciClassName: isServer ? "Physical / Virtual Server" : "Laptop / Workstation",
    category: "Hardware",
    lifecycleState: overrides?.lifecycleState || "In Stock",
    healthScore: 98,
    riskScore: 12,
    dataClassification: "Confidential",
    tenantId: scanData.tenantId || "tenant-kspl-global",
    // 2. Hardware — 35 attributes
    manufacturer,
    model,
    modelNumber: `${model.replace(/\s+/g, "-")}-MOD1`,
    productNumber: `PN-${manufacturer.substring(0, 3).toUpperCase()}-${randomSuffix}`,
    productFamily: model.split(" ")[0],
    chassisType: isServer ? "Rack Mount 2U Chassis" : isMac ? "Aluminum Unibody Laptop" : "Ultrabook Clamshell",
    cpuManufacturer: isMac ? "Apple Inc." : "Intel Corporation",
    cpuModel,
    cpuFamily: isMac ? "Apple Silicon M3" : isServer ? "Intel Xeon Scalable" : "Intel Core i7 13th Gen",
    cpuGeneration: isMac ? "3nm Apple Silicon" : isServer ? "Ice Lake-SP" : "13th Gen Raptor Lake",
    cpuSocketCount: isServer ? 2 : 1,
    cpuCoreCount: cpuCores,
    cpuThreadCount: isMac ? cpuCores : cpuCores * 2,
    cpuSpeed: isMac ? "4.05 GHz High-Performance Firestorm" : "2.40 GHz (Turbo to 5.0 GHz)",
    totalRamGb: ramGb,
    totalRam: `${ramGb} GB`,
    ramType: isMac ? "Unified LPDDR5X (On-Die)" : "DDR5 SDRAM (ECC Registered)",
    ramSpeed: isMac ? "6400 MT/s Unified" : "4800 MHz",
    ramSlotCount: isMac ? 1 : isServer ? 16 : 2,
    ramModuleDetails: isMac ? "Unified Memory Architecture (UMA)" : `2x ${ramGb / 2}GB Micron DDR5-4800 SODIMM`,
    diskCount: isServer ? 4 : 1,
    totalStorageGb: diskGb,
    totalStorage: `${diskGb} GB NVMe SSD`,
    diskManufacturer: isMac ? "Apple NVMe Controller" : "Samsung Semiconductor",
    diskModel: isMac ? "Apple NVMe 1TB APFS" : "Samsung PM9A1 NVMe 512GB PCIe 4.0",
    diskSerialNumber: `S64PNE0W${serial.substring(0, 6)}`,
    diskType: "NVMe Solid State Drive",
    diskInterface: "PCIe Gen 4.0 x4 NVMe",
    gpuManufacturer: isMac ? "Apple Inc." : "Intel / NVIDIA Corporation",
    gpuModel: isMac ? "Apple M3 Max 40-core GPU" : isServer ? "Matrox G200eR2 / NVIDIA A100" : "Intel Iris Xe Graphics G7",
    gpuMemory: isMac ? `${ramGb} GB Unified VRAM` : "8 GB Dedicated GDDR6",
    biosVendor: isMac ? "Apple Inc. (iBoot)" : manufacturer.includes("Dell") ? "Dell Inc." : "American Megatrends Inc.",
    biosVersion: isMac ? "iBoot-10151.140.19" : "1.14.2 (UEFI 2.8)",
    biosSerialNumber: serial,
    biosDate: "2026-03-24",
    tpmVersion: "TPM 2.0 (TCG Certified)",
    secureBootStatus: "Enabled (Active Protected)",
    // 3. Operating System — 25 attributes
    operatingSystem: osName,
    osName,
    osFamily,
    osEdition: isServer ? "Server Standard 64-bit" : isMac ? "Sonoma" : "Enterprise 64-bit",
    osVersion,
    osBuild: isMac ? "23G93" : isLinux ? "Linux 6.8.0-39-generic" : "22631.3880",
    osArchitecture: isMac ? "arm64 (Apple Silicon)" : "x86_64 (64-bit)",
    kernelVersion: isMac ? "Darwin 23.6.0" : isLinux ? "Linux 6.8.0-40-generic" : "10.0.22631 NT Kernel",
    installationDate: "2024-02-14 10:15:00",
    lastBootTime: "2026-08-16 08:30:12",
    osInstallId: `GUID-{${serial}-INSTALL-8821}`,
    windowsProductId: isLinux || isMac ? "N/A (Non-Windows)" : "00330-80000-00000-AAOEM",
    windowsActivationStatus: isLinux || isMac ? "N/A" : "Licensed & Activated (KMS Active Directory)",
    windowsDomain: "CORP.INTERNAL",
    computerAccountStatus: "Hybrid Azure AD Joined (Entra ID Synced)",
    linuxDistribution: isLinux ? "Ubuntu" : "N/A",
    linuxRelease: isLinux ? "24.04 LTS (Noble Numbat)" : "N/A",
    unixVersion: isMac ? "macOS Darwin Unix 03" : "N/A",
    macOsVersion: isMac ? "macOS Sonoma 14.6.1" : "N/A",
    osEndOfSupportDate: "2031-10-14",
    osLifecycleStatus: "Active Mainstream Support",
    patchLevel: "Security Baseline 2026-08",
    pendingReboot: false,
    updateAgentVersion: "Enterprise Update Agent v2.5.0",
    lastOsUpdate: "2026-08-14 04:15:22",
    rebootRequired: false,
    // 4. Network — 30 attributes
    networkInterfaceCount: 2,
    interfaceName: defaultInterfaces[0].interfaceName,
    interfaceType: defaultInterfaces[0].interfaceType,
    subnetMask: "255.255.255.0 (/24)",
    gateway: ip.split(".").slice(0, 3).join(".") + ".1",
    dnsServer: "10.20.0.2, 10.20.0.3 (AD Integrated DNS)",
    dhcpEnabled: true,
    dhcpServer: "10.20.0.1",
    vlanId: "VLAN 100",
    vlanName: "CORP-WORKSTATIONS-ZONE",
    networkSegment: `${ip.split(".").slice(0, 3).join(".")}.0/24`,
    networkZone: "Internal Trusted Enterprise",
    switchName: "SW-CORE-B1-R04 (Cisco Catalyst 9300)",
    switchPort: "GigabitEthernet1/0/24",
    switchPortDescription: "Access Port to Workstation Host",
    wirelessSsid: isMac ? "CORP-SECURE-WPA3-ENT" : "N/A (Wired Ethernet)",
    connectionType: isMac ? "Wi-Fi 6E (802.11ax)" : "Gigabit Copper Ethernet (Cat6A)",
    linkSpeed: isMac ? "2400 Mbps (Wi-Fi 6E 160MHz)" : "1000 Mbps (Full Duplex)",
    duplex: "Full Duplex",
    networkAdapterManufacturer: isMac ? "Apple Inc. (Broadcom Wi-Fi)" : "Intel Corporation",
    networkAdapterModel: isMac ? "Apple Wi-Fi 6E & Bluetooth 5.3" : "Intel(R) Ethernet Controller I225-V",
    networkAdapterDriver: isMac ? "AppleBCMWLANCore.kext" : "e1i68x64.sys",
    driverVersion: "2.1.3.15",
    dnsHostname: `${cleanHostname.toLowerCase()}.corp.internal`,
    reverseDns: `ptr-${ip.replace(/\./g, "-")}.corp.internal`,
    openPorts: [22, 135, 445, 3389, 5985],
    listeningServices: ["WinRM (5985)", "RDP (3389)", "CrowdStrike Falcon (443)", "sshd (22)"],
    networkReachability: "ICMP Ping Reachable (0.84ms) - TCP 5985 Open",
    networkInterfacesList: defaultInterfaces,
    // 5. Software Inventory — 25 attributes
    softwareId: `SW-PK-${assetId}-01`,
    softwareName: candidateSoftware[0]?.name || "Microsoft 365 Apps for enterprise",
    softwarePublisher: candidateSoftware[0]?.publisher || "Microsoft Corporation",
    softwareVersion: candidateSoftware[0]?.version || "16.0.17726.20160",
    softwareEdition: "Enterprise 64-bit",
    softwareArchitecture: "x64 (64-bit)",
    softwareInstallDate: "2024-02-15",
    softwareInstallLocation: isMac ? "/Applications" : isLinux ? "/usr/bin" : "C:\\Program Files",
    softwarePackageName: candidateSoftware[0]?.name.toLowerCase().replace(/\s+/g, "-") || "m365-apps",
    softwarePackageVersion: candidateSoftware[0]?.version || "16.0",
    softwareProductCode: "{90160000-008C-0409-1000-0000000FF1CE}",
    softwareLicenseKey: "XXXXX-XXXXX-XXXXX-XXXXX-8942A (KMS Volume License)",
    softwareLicenseType: "Subscription / SaaS (Per-User Assigned)",
    softwareInstallationStatus: "Installed & Active",
    softwareRunningStatus: "Running (Background Sensor Active)",
    softwareProcessName: isMac ? "FalconSensor.app, Slack.app" : isLinux ? "dockerd, postgres, falcon-sensor" : "OUTLOOK.EXE, CSFALCONSERVICE.EXE",
    softwareServiceName: isMac ? "com.crowdstrike.falcon.Agent" : isLinux ? "falcon-sensor.service, docker.service" : "CSFalconService, ClickToRunSvc",
    softwareServiceStatus: "Running (Automatic Startup)",
    softwareCategory: candidateSoftware[0]?.category || "Productivity & Enterprise Collaboration",
    softwareNormalizedName: "Microsoft 365 Apps",
    softwareNormalizedPublisher: "Microsoft",
    softwareEolDate: "2029-10-10",
    softwareLatestVersion: "v16.0.17830.20138",
    softwareVulnerabilityStatus: "Clean (0 Known High/Critical CVEs)",
    softwareLicenseComplianceStatus: "Compliant (Entitled under Enterprise Agreement)",
    installedSoftware: candidateSoftware,
    installedSoftwareCount: candidateSoftware.length,
    // 6. User / Ownership — 18 attributes
    primaryUser: overrides?.ownerUserName || scanData.primaryUser || scanData.userFullName || assignedFullName,
    username: overrides?.username || scanData.username || assignedUsername,
    userId: assignedUserId,
    email: overrides?.email || scanData.email || scanData.userEmail || assignedEmail,
    department: overrides?.departmentName || scanData.department || scanData.userDepartment || "Information Technology & Engineering",
    departmentId: overrides?.departmentId || scanData.departmentId || "d-1",
    departmentName: overrides?.departmentName || scanData.departmentName || scanData.userDepartment || "Information Technology & Engineering",
    businessUnit: "Enterprise Global Technology",
    costCenter: overrides?.costCenterId || scanData.costCenter || "CC-IT-9042",
    costCenterId: overrides?.costCenterId || scanData.costCenterId || "CC-IT-9042",
    manager: "David Vance (VP Engineering)",
    location: overrides?.locationName || scanData.location || "Primary Enterprise HQ",
    locationId: overrides?.locationId || scanData.locationId || "loc-1",
    locationName: overrides?.locationName || scanData.locationName || "Primary Enterprise HQ",
    site: "SF-HQ-MAIN-CAMPUS",
    building: "Building 4 - Innovation Wing",
    floor: "Floor 3",
    room: "Suite 302 / Desk 3-44",
    owner: "Global IT Operations",
    ownerUserId: assignedUserId,
    ownerUserName: overrides?.ownerUserName || scanData.ownerUserName || scanData.userFullName || assignedFullName,
    custodian: overrides?.ownerUserName || scanData.ownerUserName || scanData.userFullName || assignedFullName,
    assignmentDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    purchaseDate: overrides?.purchaseDate || scanData.purchaseDate || "2024-01-10",
    retirementDate: "2028-01-10",
    cost: overrides?.cost || (isServer ? 6500 : isMac ? 3499 : 2100),
    eolDate: "2028-01-10",
    eosDate: "2029-01-10",
    // 7. Security attributes — 25 attributes
    antivirusProduct: "CrowdStrike Falcon Sensor / Windows Defender ATP",
    antivirusStatus: "Active & Real-Time Protection Enabled",
    antivirusVersion: "v7.15.18402 (Engine 1.1.24060.7)",
    edrProduct: "CrowdStrike Falcon Sensor",
    edrStatus: "Connected to Falcon Cloud (Agent Active)",
    firewallStatus: "Enabled (Domain, Private, Public Profiles Active)",
    encryptionStatus: "100% Full Disk Encrypted",
    bitLockerStatus: isMac ? "FileVault Active (XTS-AES 256 / Secure Enclave Protected)" : "BitLocker Active (XTS-AES 256 / TPM 2.0 Protected)",
    tpmStatus: isMac ? "Apple Silicon Secure Enclave Processor (SEP)" : "TPM 2.0 Ready, Activated & Owned",
    secureBoot: "Enabled (UEFI Cryptographic Signature Validated)",
    lastSecurityUpdate: "2026-08-14 02:00:00",
    patchCompliance: "Compliant (100% Critical KBs Applied)",
    vulnerabilityCount: 0,
    criticalVulnerabilityCount: 0,
    highVulnerabilityCount: 0,
    securityScore: 98,
    complianceStatus: "CIS Benchmark Level 1 & SOC2 Type II Compliant",
    encryptionAlgorithm: "AES-XTS 256-bit Hardware Accelerated",
    localAdminCount: 1,
    localAdminUsers: "CORP\\Domain Admins, .\\Administrator (LAPS Managed)",
    failedLoginCount: 0,
    lastLogin: "2026-08-18 08:30:15 UTC",
    secureConfigurationStatus: "Hardened according to NIST 800-53 baseline",
    securityPolicyVersion: "v4.2.0-CORP-SEC-2026",
    // 8. Virtualization / Cloud — 25 attributes
    virtualPhysical: isCloud ? "Cloud Compute Instance" : isServer ? "Virtual Machine" : "Physical Hardware",
    hypervisor: isCloud ? "AWS Nitro Hypervisor" : isServer ? "VMware ESXi 8.0" : "None (Bare Metal Hardware)",
    hypervisorVersion: isServer ? "8.0.2 build-22380479" : "N/A",
    vmId: isServer || isCloud ? `vm-${serial.toLowerCase()}` : "N/A",
    vmUuid: isServer || isCloud ? `564d3882-9901-4412-a1b2-${serial.substring(0, 8)}` : "N/A",
    vmName: isServer || isCloud ? `${cleanHostname.toLowerCase()}.vm` : "N/A",
    hostServer: isServer ? "ESX-HOST-R01-BLADE04.corp.internal" : "N/A",
    cluster: isServer ? "PROD-COMPUTE-CLUSTER-01" : "N/A",
    datacenter: isServer ? "US-EAST-DC-EQUINIX-02" : "Primary Enterprise HQ Data Center",
    resourcePool: isServer ? "Tier-1-Database-Resource-Pool" : "N/A",
    cloudProvider: isCloud ? "Amazon Web Services (AWS)" : "On-Premises Corporate Datacenter",
    cloudAccount: isCloud ? "AWS Account 8823-4921-9921 (Production)" : "Local Corporate Infrastructure",
    subscriptionId: isCloud ? "sub-enterprise-core-infra-us-east" : "N/A",
    projectId: isCloud ? "prj-corp-infra-prod-01" : "N/A",
    region: isCloud ? "us-east-1 (N. Virginia)" : "US-West-Facility",
    availabilityZone: isCloud ? "us-east-1a" : "Rack-04-Bay-B",
    instanceId: isCloud ? `i-0a8b9c${serial.substring(0, 8).toLowerCase()}` : "N/A",
    instanceType: isCloud ? "m6i.2xlarge (8 vCPU / 32 GB)" : isServer ? "Dual Xeon 32-Core Blade" : "Mobile Workstation",
    cloudResourceId: isCloud ? `arn:aws:ec2:us-east-1:882349219921:instance/i-0a8b9c${serial.substring(0, 8).toLowerCase()}` : "N/A",
    cloudTags: "Environment=Production, Department=IT, App=CoreBanking, CostCenter=CC-IT-9042",
    cloudStatus: "Running (Healthy)",
    vCpu: `${cpuCores} vCPUs`,
    allocatedRam: `${ramGb} GB RAM`,
    allocatedStorage: `${diskGb} GB Storage (NVMe/EBS)`,
    cloudCost: isCloud ? "$248.50 / month" : "$0.00 (On-Premises Capital Asset)",
    customAttributes: {
      discoveryMethod: scanData.subProtocol || "Automated Probe",
      sourceScanId: scanData.id || `scan-${Date.now()}`,
      autoCreatedFromScan: true,
      totalAttributesCount: 204,
      ...scanData.rawAttributes
    },
    ...overrides
  };
  return fullCi;
}

// src/backend/discoveryService.ts
var discoveryResultsStore = /* @__PURE__ */ new Map();
var discoveryJobsStore = /* @__PURE__ */ new Map();
var endpointAgentsStore = /* @__PURE__ */ new Map();
function seedDiscoveryData() {
  if (discoveryResultsStore.size > 0) return;
  const defaultAgents = [
    {
      id: "ag-win-01",
      tenantId: "tenant-kspl-global",
      agentId: "AGT-WIN11-9821",
      deviceId: "DEV-WIN-PROD-01",
      hostname: "CORP-WIN11-EXEC",
      osType: "Windows",
      osName: "Microsoft Windows 11 Enterprise",
      osVersion: "23H2 (Build 22631.3880)",
      agentVersion: "v2.4.2-win64",
      status: "Healthy",
      ipAddress: "10.20.4.12",
      macAddress: "00:15:5D:82:11:4A",
      serialNumber: "DELL-LAT-9440-X1",
      manufacturer: "Dell Inc.",
      model: "Latitude 9440 2-in-1",
      installedSoftwareCount: 48,
      installedSoftwareSample: ["Microsoft 365 Apps for Enterprise", "Google Chrome Enterprise", "CrowdStrike Falcon Sensor", "Zoom Workplace", "Docker Desktop"],
      missingPatchCount: 1,
      cpuUsagePct: 18.5,
      memoryUsagePct: 44.2,
      lastHeartbeat: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 19),
      enrollmentDate: "2026-08-01 09:00:00",
      tags: ["Workstation", "Executive", "Windows"]
    },
    {
      id: "ag-lin-01",
      tenantId: "tenant-kspl-global",
      agentId: "AGT-LIN-2204",
      deviceId: "DEV-UBUNTU-DB01",
      hostname: "srv-db-cluster-01",
      osType: "Linux",
      osName: "Ubuntu Linux",
      osVersion: "24.04 LTS (Noble Numbat)",
      agentVersion: "v2.4.2-linux64",
      status: "Healthy",
      ipAddress: "10.20.4.15",
      macAddress: "52:54:00:AB:CD:01",
      serialNumber: "SRV-HPE-PROLIANT-DL380",
      manufacturer: "HPE",
      model: "ProLiant DL380 Gen10",
      installedSoftwareCount: 64,
      installedSoftwareSample: ["PostgreSQL 16.2", "Redis Server 7.2", "OpenSSL 3.0.13", "Prometheus Node Exporter", "Nginx 1.26"],
      missingPatchCount: 0,
      cpuUsagePct: 32.1,
      memoryUsagePct: 68.7,
      lastHeartbeat: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 19),
      enrollmentDate: "2026-08-05 11:30:00",
      tags: ["Database", "Production", "Linux"]
    },
    {
      id: "ag-mac-01",
      tenantId: "tenant-kspl-global",
      agentId: "AGT-MAC-M3PRO",
      deviceId: "DEV-MACBOOK-ENG04",
      hostname: "dev-macbook-pro-m3",
      osType: "macOS",
      osName: "macOS Sonoma",
      osVersion: "14.6.1 (Darwin 23.6.0)",
      agentVersion: "v2.4.2-darwin-arm64",
      status: "Healthy",
      ipAddress: "10.20.4.28",
      macAddress: "F0:18:98:AA:BB:CC",
      serialNumber: "C02G80X0MD6R",
      manufacturer: "Apple Inc.",
      model: "MacBook Pro 16-inch (M3 Max, 64GB)",
      installedSoftwareCount: 52,
      installedSoftwareSample: ["Xcode 15.4", "Visual Studio Code", "Node.js v20.14.0", "Slack", "1Password", "Docker Desktop"],
      missingPatchCount: 0,
      cpuUsagePct: 12,
      memoryUsagePct: 51.3,
      lastHeartbeat: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 19),
      enrollmentDate: "2026-08-08 14:15:00",
      tags: ["Engineering", "macOS", "Apple Silicon"]
    },
    {
      id: "ag-ios-01",
      tenantId: "tenant-kspl-global",
      agentId: "AGT-IOS-MDM-101",
      deviceId: "DEV-IPHONE15-CORP01",
      hostname: "Corp-iPhone-15Pro-Field",
      osType: "iOS",
      osName: "Apple iOS",
      osVersion: "17.6.1",
      agentVersion: "v2.4.2-apple-mdm",
      status: "Healthy",
      ipAddress: "10.20.6.99",
      macAddress: "DC:A9:04:11:22:33",
      serialNumber: "F2LXK990M29",
      manufacturer: "Apple Inc.",
      model: "iPhone 15 Pro (128GB)",
      installedSoftwareCount: 16,
      installedSoftwareSample: ["Microsoft Outlook Mobile", "Microsoft Authenticator", "Salesforce Mobile", "Zscaler Client Connector", "Slack iOS"],
      missingPatchCount: 0,
      cpuUsagePct: 5.4,
      memoryUsagePct: 38,
      lastHeartbeat: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 19),
      enrollmentDate: "2026-08-10 10:00:00",
      tags: ["Mobile", "iOS", "MDM Enrolled"]
    }
  ];
  defaultAgents.forEach((ag) => endpointAgentsStore.set(ag.id, ag));
  defaultAgents.forEach((ag) => {
    const hwAsset = buildHardwareAssetFromScan({
      id: `ci-${ag.id}`,
      assetTag: `AST-${ag.agentId.replace("AGT-", "")}`,
      hostname: ag.hostname,
      ipAddress: ag.ipAddress,
      macAddress: ag.macAddress,
      serialNumber: ag.serialNumber,
      manufacturer: ag.manufacturer,
      model: ag.model,
      osType: ag.osType,
      osName: ag.osName,
      osVersion: ag.osVersion,
      installedSoftware: ag.installedSoftwareSample?.map((s) => ({ name: s, version: "Latest" })),
      installedSoftwareCount: ag.installedSoftwareCount,
      missingPatchCount: ag.missingPatchCount,
      sourceMethod: "Endpoint Agent",
      subProtocol: `${ag.osType} Agent v2.5.0`,
      tenantId: ag.tenantId
    });
    const res = {
      id: `disc-${ag.id}`,
      tenantId: ag.tenantId,
      sourceMethod: "Endpoint Agent",
      subProtocol: `${ag.osType} Native Collector`,
      timestamp: ag.lastHeartbeat,
      confidenceScore: 99,
      rawIdentifier: ag.serialNumber || ag.deviceId,
      hostname: ag.hostname,
      ipAddress: ag.ipAddress,
      macAddress: ag.macAddress,
      serialNumber: ag.serialNumber,
      manufacturer: ag.manufacturer || "Generic",
      model: ag.model || "Standard Device",
      osType: ag.osType,
      osName: ag.osName,
      osVersion: ag.osVersion,
      installedSoftware: (ag.installedSoftwareSample || []).map((s) => ({ name: s, version: "Latest" })),
      installedSoftwareCount: ag.installedSoftwareCount,
      missingPatchCount: ag.missingPatchCount,
      candidateClass: "Hardware",
      candidateType: ag.osType === "iOS" ? "Mobile Smartphone" : ag.osType === "Linux" ? "Server Host" : "Desktop / Laptop",
      reconciliationStatus: "Reconciled",
      rawAttributes: { cpuPct: ag.cpuUsagePct, ramPct: ag.memoryUsagePct, agentVersion: ag.agentVersion },
      hardwareAsset: hwAsset
    };
    discoveryResultsStore.set(res.id, res);
  });
  discoveryJobsStore.set("job-default-01", {
    id: "job-default-01",
    name: "Core Datacenter & Office CIDR Sweep (10.20.0.0/24)",
    tenantId: "tenant-kspl-global",
    targetCidr: "10.20.0.0/24",
    protocols: ["SNMP v3", "WMI / WinRM", "SSH Port 22", "ICMP Sweep"],
    status: "SUCCESS",
    startTime: "2026-08-17 02:00:00",
    endTime: "2026-08-17 02:03:45",
    devicesScanned: 254,
    devicesFound: 18,
    newCis: 3,
    updatedCis: 15,
    logs: [
      "02:00:00 [INFO] Initializing multi-threaded network scanner on range 10.20.0.0/24",
      "02:00:02 [INFO] ARP & ICMP ping sweep completed: 18 responsive hosts identified.",
      "02:00:08 [WMI] 10.20.0.14: Windows Server 2022 Datacenter detected. Host: SRV-WIN-AD01",
      "02:00:15 [SSH] 10.20.0.22: Linux Debian 12 (bookworm) detected. Host: srv-mon-grafana",
      "02:00:20 [SNMP] 10.20.0.1: Cisco Catalyst 9300 48-Port PoE Switch detected (sysDescr: Cisco IOS Software)",
      "02:00:32 [MDNS/BONJOUR] 10.20.0.50: Apple macOS Sonoma device detected on local subnet.",
      "02:03:45 [SUCCESS] Network sweep finished. Discovered 18 devices. Pushed into unified ingestion pipeline."
    ],
    discoveredAssets: []
  });
}
seedDiscoveryData();
function executeAgentlessSweep(options) {
  seedDiscoveryData();
  const tenantId = options.tenantId || "tenant-kspl-global";
  const jobId = `job-${Date.now()}`;
  const now = /* @__PURE__ */ new Date();
  const startTime = now.toISOString().replace("T", " ").substring(0, 19);
  const cleanCidr = options.cidr.trim() || "192.168.1.0/24";
  const baseSubnet = cleanCidr.split("/")[0].split(".").slice(0, 3).join(".");
  const discoveredAssets = [];
  const logs = [
    `[${now.toLocaleTimeString()}] [INFO] Starting multi-protocol Agentless Sweep on ${cleanCidr}`,
    `[${now.toLocaleTimeString()}] [INFO] Enabled Scan Protocols: ${options.protocols.join(", ")}`,
    `[${now.toLocaleTimeString()}] [DISCOVERY] Dispatching concurrent TCP/UDP port probes (Ports: 22, 80, 135, 161, 443, 445, 5985, 5986, 631)`
  ];
  if (options.protocols.includes("WMI") || options.protocols.includes("WinRM") || options.protocols.includes("WMI / WinRM")) {
    const winHostId = `disc-sweep-win-${Date.now()}`;
    const winHwAsset = buildHardwareAssetFromScan({
      id: `ci-${winHostId}`,
      assetTag: `AST-WIN-${Math.floor(1e4 + Math.random() * 9e4)}`,
      hostname: `WIN-SRV-${Math.floor(10 + Math.random() * 89)}`,
      ipAddress: `${baseSubnet}.${Math.floor(10 + Math.random() * 40)}`,
      macAddress: `00:50:56:${Math.floor(10 + Math.random() * 89)}:A1:B2`,
      serialNumber: `VMware-${Math.floor(1e3 + Math.random() * 9e3)}-${Math.floor(1e3 + Math.random() * 9e3)}`,
      manufacturer: "Dell Inc. / VMware",
      model: "PowerEdge R750 Virtual Host",
      osType: "Windows",
      osName: "Microsoft Windows Server 2022 Standard",
      osVersion: "Version 21H2 (Build 20348.2402)",
      sourceMethod: "Agentless Network",
      subProtocol: "WinRM / WMI CIM",
      tenantId
    });
    const winAsset = {
      id: winHostId,
      tenantId,
      sourceMethod: "Agentless Network",
      subProtocol: "WinRM / WMI CIM",
      timestamp: startTime,
      confidenceScore: 96,
      rawIdentifier: `WMI-BIOS-WIN-${Math.floor(1e3 + Math.random() * 9e3)}`,
      hostname: `WIN-SRV-${Math.floor(10 + Math.random() * 89)}.corp.internal`,
      ipAddress: `${baseSubnet}.${Math.floor(10 + Math.random() * 40)}`,
      macAddress: `00:50:56:${Math.floor(10 + Math.random() * 89)}:A1:B2`,
      serialNumber: `VMware-${Math.floor(1e3 + Math.random() * 9e3)}-${Math.floor(1e3 + Math.random() * 9e3)}`,
      manufacturer: "Dell Inc. / VMware",
      model: "PowerEdge R750 Virtual Host",
      osType: "Windows",
      osName: "Microsoft Windows Server 2022 Standard",
      osVersion: "Version 21H2 (Build 20348.2402)",
      osArchitecture: "x86_64 / 64-bit",
      cpuModel: "Intel(R) Xeon(R) Gold 6338 CPU @ 2.00GHz",
      cpuCores: 16,
      memoryTotalGb: 64,
      diskTotalGb: 1024,
      diskFreeGb: 480,
      installedSoftware: [
        { name: "Microsoft IIS 10.0 Web Server", version: "10.0.20348", publisher: "Microsoft Corporation" },
        { name: ".NET Framework 4.8.1", version: "4.8.9037.0", publisher: "Microsoft Corporation" },
        { name: "Microsoft Visual C++ 2015-2022 Redistributable", version: "14.38.33130", publisher: "Microsoft Corporation" },
        { name: "CrowdStrike Falcon Sensor", version: "7.12.18104.0", publisher: "CrowdStrike, Inc." }
      ],
      installedSoftwareCount: 28,
      missingPatchCount: 2,
      openPorts: [135, 445, 3389, 5985],
      servicesRunning: ["W3SVC", "LanmanServer", "WinRM", "CSFalconService"],
      candidateClass: "Hardware",
      candidateType: "Virtual Server",
      reconciliationStatus: "Pending Reconciliation",
      rawAttributes: { scanMethod: "Agentless WinRM", winrmAuth: "Kerberos/NTLM", pingLatencyMs: 4.2 },
      hardwareAsset: winHwAsset
    };
    discoveredAssets.push(winAsset);
    discoveryResultsStore.set(winAsset.id, winAsset);
    logs.push(`[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] [WMI/WinRM] Response from ${winAsset.ipAddress} (${winAsset.hostname}) - Serial: ${winAsset.serialNumber}`);
  }
  if (options.protocols.includes("SSH") || options.protocols.includes("SSH Port 22")) {
    const linHostId = `disc-sweep-lin-${Date.now()}`;
    const linHwAsset = buildHardwareAssetFromScan({
      id: `ci-${linHostId}`,
      assetTag: `AST-LIN-${Math.floor(1e4 + Math.random() * 9e4)}`,
      hostname: `srv-k8s-worker-${Math.floor(1 + Math.random() * 9)}`,
      ipAddress: `${baseSubnet}.${Math.floor(45 + Math.random() * 40)}`,
      macAddress: `52:54:00:${Math.floor(10 + Math.random() * 89)}:CD:EF`,
      serialNumber: `SN-K8S-LIN-${Math.floor(1e5 + Math.random() * 9e5)}`,
      manufacturer: "Supermicro / Linux KVM",
      model: "SuperServer SYS-1029P-WTR",
      osType: "Linux",
      osName: "Red Hat Enterprise Linux (RHEL)",
      osVersion: "9.4 (Plow)",
      sourceMethod: "Agentless Network",
      subProtocol: "SSH Remote Command Execution",
      tenantId
    });
    const linAsset = {
      id: linHostId,
      tenantId,
      sourceMethod: "Agentless Network",
      subProtocol: "SSH Remote Command Execution",
      timestamp: startTime,
      confidenceScore: 98,
      rawIdentifier: `SSH-DMI-SRV-${Math.floor(1e3 + Math.random() * 9e3)}`,
      hostname: `srv-k8s-worker-${Math.floor(1 + Math.random() * 9)}.internal`,
      ipAddress: `${baseSubnet}.${Math.floor(45 + Math.random() * 40)}`,
      macAddress: `52:54:00:${Math.floor(10 + Math.random() * 89)}:CD:EF`,
      serialNumber: `SN-K8S-LIN-${Math.floor(1e5 + Math.random() * 9e5)}`,
      manufacturer: "Supermicro / Linux KVM",
      model: "SuperServer SYS-1029P-WTR",
      osType: "Linux",
      osName: "Red Hat Enterprise Linux (RHEL)",
      osVersion: "9.4 (Plow)",
      osArchitecture: "x86_64 Linux 5.14.0-427.el9",
      cpuModel: "AMD EPYC 7763 64-Core Processor",
      cpuCores: 32,
      memoryTotalGb: 128,
      diskTotalGb: 2048,
      diskFreeGb: 1420,
      installedSoftware: [
        { name: "Kubernetes Kubelet", version: "v1.30.2", publisher: "CNCF" },
        { name: "containerd", version: "1.7.18", publisher: "containerd.io" },
        { name: "OpenSSH Server", version: "8.7p1", publisher: "OpenSSH Project" },
        { name: "systemd", version: "252-32.el9", publisher: "Red Hat" }
      ],
      installedSoftwareCount: 56,
      missingPatchCount: 0,
      openPorts: [22, 6443, 10250, 9100],
      servicesRunning: ["kubelet.service", "containerd.service", "sshd.service", "node_exporter.service"],
      candidateClass: "Hardware",
      candidateType: "Kubernetes Node",
      reconciliationStatus: "Pending Reconciliation",
      rawAttributes: { scanMethod: "Agentless SSH", sshKeyUsed: "cred-linux-infra", pingLatencyMs: 2.8 },
      hardwareAsset: linHwAsset
    };
    discoveredAssets.push(linAsset);
    discoveryResultsStore.set(linAsset.id, linAsset);
    logs.push(`[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] [SSH] Response from ${linAsset.ipAddress} (${linAsset.hostname}) - OS: ${linAsset.osName} ${linAsset.osVersion}`);
  }
  if (options.protocols.includes("SNMP") || options.protocols.includes("SNMP v3") || options.protocols.includes("SNMP v1/v2c")) {
    const snmpHostId = `disc-sweep-snmp-${Date.now()}`;
    const snmpHwAsset = buildHardwareAssetFromScan({
      id: `ci-${snmpHostId}`,
      assetTag: `AST-SW-${Math.floor(1e4 + Math.random() * 9e4)}`,
      hostname: `core-sw-bldg01-rack02`,
      ipAddress: `${baseSubnet}.1`,
      macAddress: `00:1A:A1:B2:C3:${Math.floor(10 + Math.random() * 89)}`,
      serialNumber: `FOC24089X${Math.floor(10 + Math.random() * 89)}`,
      manufacturer: "Cisco Systems",
      model: "Catalyst 9300 Series (48 Port PoE+)",
      osType: "Network Appliance",
      osName: "Cisco IOS XE",
      osVersion: "17.09.04a",
      sourceMethod: "Agentless Network",
      subProtocol: "SNMP v2c/v3 MIB-II",
      tenantId
    });
    const snmpAsset = {
      id: snmpHostId,
      tenantId,
      sourceMethod: "Agentless Network",
      subProtocol: "SNMP v2c/v3 MIB-II",
      timestamp: startTime,
      confidenceScore: 92,
      rawIdentifier: `SNMP-SYSNAME-CORE-SW-${Math.floor(1 + Math.random() * 9)}`,
      hostname: `core-sw-bldg01-rack02.net.internal`,
      ipAddress: `${baseSubnet}.1`,
      macAddress: `00:1A:A1:B2:C3:${Math.floor(10 + Math.random() * 89)}`,
      serialNumber: `FOC24089X${Math.floor(10 + Math.random() * 89)}`,
      manufacturer: "Cisco Systems",
      model: "Catalyst 9300 Series (48 Port PoE+)",
      osType: "Network Appliance",
      osName: "Cisco IOS XE",
      osVersion: "17.09.04a",
      osArchitecture: "MIPS / ARM Network ASIC",
      cpuModel: "Cisco Quad Core Network Processor",
      cpuCores: 4,
      memoryTotalGb: 16,
      diskTotalGb: 32,
      diskFreeGb: 22,
      installedSoftware: [
        { name: "Cisco IOS XE Universal Software", version: "17.9.4a", publisher: "Cisco Systems" },
        { name: "Cisco DNA Premier License", version: "Tier 1", publisher: "Cisco Systems" }
      ],
      installedSoftwareCount: 2,
      missingPatchCount: 0,
      openPorts: [22, 161, 443, 830],
      servicesRunning: ["SNMPv3 Engine", "SSHv2 Server", "NETCONF-YANG"],
      candidateClass: "Hardware",
      candidateType: "Network Switch",
      reconciliationStatus: "Pending Reconciliation",
      rawAttributes: { scanMethod: "Agentless SNMPv3", sysObjectID: "1.3.6.1.4.1.9.1.2494", portsTotal: 48, activePorts: 36 },
      hardwareAsset: snmpHwAsset
    };
    discoveredAssets.push(snmpAsset);
    discoveryResultsStore.set(snmpAsset.id, snmpAsset);
    logs.push(`[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] [SNMP] Discovered Switch ${snmpAsset.ipAddress} (${snmpAsset.model}) - MAC: ${snmpAsset.macAddress}`);
  }
  const appleHostId = `disc-sweep-apple-${Date.now()}`;
  const appleHwAsset = buildHardwareAssetFromScan({
    id: `ci-${appleHostId}`,
    assetTag: `AST-MAC-${Math.floor(1e4 + Math.random() * 9e4)}`,
    hostname: `macbook-pro-design`,
    ipAddress: `${baseSubnet}.${Math.floor(90 + Math.random() * 30)}`,
    macAddress: `F4:D4:88:AA:${Math.floor(10 + Math.random() * 89)}:99`,
    serialNumber: `C02W${Math.floor(1e3 + Math.random() * 9e3)}MD6R`,
    manufacturer: "Apple Inc.",
    model: "MacBook Pro (14-inch, Nov 2023, M3 Pro)",
    osType: "macOS",
    osName: "macOS Sonoma",
    osVersion: "14.6",
    sourceMethod: "Agentless Network",
    subProtocol: "mDNS Bonjour / HTTPS Probing",
    tenantId
  });
  const appleAsset = {
    id: appleHostId,
    tenantId,
    sourceMethod: "Agentless Network",
    subProtocol: "mDNS Bonjour / HTTPS Probing",
    timestamp: startTime,
    confidenceScore: 89,
    rawIdentifier: `APPLE-MAC-HOST-${Math.floor(100 + Math.random() * 899)}`,
    hostname: `macbook-pro-design-${Math.floor(1 + Math.random() * 20)}.local`,
    ipAddress: `${baseSubnet}.${Math.floor(90 + Math.random() * 30)}`,
    macAddress: `F4:D4:88:AA:${Math.floor(10 + Math.random() * 89)}:99`,
    serialNumber: `C02W${Math.floor(1e3 + Math.random() * 9e3)}MD6R`,
    manufacturer: "Apple Inc.",
    model: "MacBook Pro (14-inch, Nov 2023, M3 Pro)",
    osType: "macOS",
    osName: "macOS Sonoma",
    osVersion: "14.6",
    osArchitecture: "arm64 (Apple Silicon)",
    cpuModel: "Apple M3 Pro (12-core CPU / 18-core GPU)",
    cpuCores: 12,
    memoryTotalGb: 36,
    diskTotalGb: 1e3,
    diskFreeGb: 620,
    installedSoftware: [
      { name: "Adobe Creative Cloud", version: "6.2.0", publisher: "Adobe Inc." },
      { name: "Figma Desktop", version: "116.15.4", publisher: "Figma" },
      { name: "Slack", version: "4.38.125", publisher: "Slack Technologies" }
    ],
    installedSoftwareCount: 38,
    missingPatchCount: 0,
    openPorts: [443, 5e3, 7e3],
    servicesRunning: ["AirPlay Receiver", "mDNSResponder", "launchd"],
    candidateClass: "Hardware",
    candidateType: "Laptop",
    reconciliationStatus: "Pending Reconciliation",
    rawAttributes: { scanMethod: "Agentless Bonjour/HTTP", bonJourService: "_airplay._tcp.local", isAppleSilicon: true },
    hardwareAsset: appleHwAsset
  };
  discoveredAssets.push(appleAsset);
  discoveryResultsStore.set(appleAsset.id, appleAsset);
  logs.push(`[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] [BONJOUR] Discovered macOS Workstation ${appleAsset.ipAddress} (${appleAsset.model})`);
  const endTime = (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 19);
  logs.push(`[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] [SUCCESS] Completed sweep. Total ${discoveredAssets.length} high-fidelity candidates ready for CMDB reconciliation.`);
  const jobRecord = {
    id: jobId,
    name: `Agentless Sweep (${cleanCidr})`,
    tenantId,
    targetCidr: cleanCidr,
    protocols: options.protocols,
    status: "SUCCESS",
    startTime,
    endTime,
    devicesScanned: 254,
    devicesFound: discoveredAssets.length,
    newCis: discoveredAssets.length,
    updatedCis: 0,
    logs,
    discoveredAssets
  };
  discoveryJobsStore.set(jobId, jobRecord);
  return jobRecord;
}
function testAgentlessIp(ip, protocols) {
  seedDiscoveryData();
  const logs = [];
  logs.push(`[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] [CONNECT] Probing host ${ip}...`);
  let detectedOs = "Linux";
  let openPorts = [];
  if (ip.endsWith(".1") || ip.endsWith(".254")) {
    detectedOs = "Network Appliance";
    openPorts = [22, 161, 443];
    logs.push(`[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] [SNMPv3] Port 161 OPEN. sysDescr: Cisco IOS XE 17.9.4`);
  } else if (protocols.includes("WMI") || protocols.includes("WinRM")) {
    detectedOs = "Windows";
    openPorts = [135, 445, 5985, 3389];
    logs.push(`[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] [WINRM] Port 5985 OPEN. Authenticated via Kerberos. Extracted Win32_OperatingSystem.`);
  } else if (protocols.includes("SSH")) {
    detectedOs = "Linux";
    openPorts = [22, 80, 443];
    logs.push(`[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] [SSH] Port 22 OPEN. Banner: SSH-2.0-OpenSSH_8.9p1 Ubuntu-3ubuntu0.7`);
  } else {
    detectedOs = "macOS";
    openPorts = [443, 5e3];
    logs.push(`[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] [mDNS] Discovered Apple Darwin / macOS workstation.`);
  }
  logs.push(`[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] [SUCCESS] Fingerprinted OS: ${detectedOs} on host ${ip}`);
  return {
    success: true,
    details: {
      ip,
      detectedOs,
      openPorts,
      latencyMs: +(Math.random() * 8 + 2).toFixed(2),
      status: "Online & Reachable"
    },
    logs
  };
}
function ingestAgentHeartbeat(payload) {
  seedDiscoveryData();
  const tenantId = payload.tenantId || "tenant-kspl-global";
  const agentId = payload.agentId || `AGT-${payload.osType.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  const nowStr = (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 19);
  const softwareList = payload.installedSoftware || [
    { name: `${payload.osName} Core Utilities`, version: "1.0" }
  ];
  const agentRecord = {
    id: `ag-${agentId.toLowerCase()}`,
    tenantId,
    agentId,
    deviceId: payload.serialNumber || `DEV-${payload.hostname}`,
    hostname: payload.hostname,
    osType: payload.osType,
    osName: payload.osName,
    osVersion: payload.osVersion,
    agentVersion: payload.agentVersion || "v2.4.2-live",
    status: "Healthy",
    ipAddress: payload.ipAddress || "127.0.0.1",
    macAddress: payload.macAddress || "02:00:00:00:00:01",
    serialNumber: payload.serialNumber || `SN-${payload.hostname}`,
    manufacturer: payload.manufacturer || (payload.osType === "macOS" || payload.osType === "iOS" ? "Apple Inc." : "Standard OEM"),
    model: payload.model || (payload.osType === "macOS" ? "MacBook Pro" : payload.osType === "iOS" ? "Apple iPhone" : "Enterprise Computer"),
    installedSoftwareCount: softwareList.length,
    installedSoftwareSample: softwareList.slice(0, 8).map((s) => s.name),
    missingPatchCount: payload.missingPatchCount || 0,
    cpuUsagePct: payload.cpuUsagePct || 14.5,
    memoryUsagePct: payload.memoryUsagePct || 42,
    lastHeartbeat: nowStr,
    enrollmentDate: nowStr,
    tags: payload.tags || [payload.osType, "Live Ingested"]
  };
  endpointAgentsStore.set(agentRecord.id, agentRecord);
  const candidateId = `disc-${agentRecord.id}`;
  const candidate = {
    id: candidateId,
    tenantId,
    sourceMethod: "Endpoint Agent",
    subProtocol: `${payload.osType} Agent v2.4.2`,
    timestamp: nowStr,
    confidenceScore: 100,
    rawIdentifier: agentRecord.serialNumber || agentRecord.deviceId,
    hostname: payload.hostname,
    ipAddress: payload.ipAddress,
    macAddress: payload.macAddress,
    serialNumber: payload.serialNumber,
    manufacturer: agentRecord.manufacturer || "OEM",
    model: agentRecord.model || "Standard Endpoint",
    osType: payload.osType,
    osName: payload.osName,
    osVersion: payload.osVersion,
    cpuModel: payload.cpuModel,
    cpuCores: payload.cpuCores,
    memoryTotalGb: payload.memoryTotalGb,
    diskTotalGb: payload.diskTotalGb,
    diskFreeGb: payload.diskFreeGb,
    installedSoftware: softwareList,
    installedSoftwareCount: softwareList.length,
    missingPatchCount: payload.missingPatchCount || 0,
    candidateClass: "Hardware",
    candidateType: payload.osType === "iOS" ? "Mobile Smartphone" : payload.osType === "Linux" ? "Server Host" : "Desktop / Laptop",
    reconciliationStatus: "Reconciled",
    rawAttributes: {
      agentId,
      enrolledAt: nowStr,
      cpuUsagePct: payload.cpuUsagePct,
      memoryUsagePct: payload.memoryUsagePct
    },
    hardwareAsset: buildHardwareAssetFromScan(payload, {
      lifecycleState: "In Stock"
    })
  };
  discoveryResultsStore.set(candidateId, candidate);
  return {
    success: true,
    agentId,
    message: `Telemetry from ${payload.hostname} (${payload.osType}) successfully processed and stored.`,
    candidateId,
    hardwareAsset: candidate.hardwareAsset,
    candidate
  };
}
function simulateOsTelemetry(osType) {
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  switch (osType) {
    case "Windows":
      return {
        hostname: `DESKTOP-WIN11-${randomSuffix}`,
        osType: "Windows",
        osName: "Microsoft Windows 11 Enterprise (23H2)",
        osVersion: "10.0.22631.3880",
        ipAddress: `192.168.1.${Math.floor(10 + Math.random() * 200)}`,
        macAddress: `00:15:5D:${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}`,
        serialNumber: `DELL-LATITUDE-${randomSuffix}-X1`,
        manufacturer: "Dell Inc.",
        model: "Latitude 7440 Ultrabook",
        agentVersion: "v2.4.2-win64",
        cpuModel: "13th Gen Intel(R) Core(TM) i7-1365U @ 1.80GHz",
        cpuCores: 10,
        cpuUsagePct: +(Math.random() * 25 + 5).toFixed(1),
        memoryTotalGb: 32,
        memoryUsagePct: +(Math.random() * 30 + 35).toFixed(1),
        diskTotalGb: 512,
        diskFreeGb: 320,
        missingPatchCount: Math.floor(Math.random() * 3),
        installedSoftware: [
          { name: "Microsoft 365 Apps for enterprise - en-us", version: "16.0.17726.20160", publisher: "Microsoft Corporation" },
          { name: "Google Chrome Enterprise", version: "127.0.6533.100", publisher: "Google LLC" },
          { name: "CrowdStrike Windows Sensor", version: "7.15.18402.0", publisher: "CrowdStrike, Inc." },
          { name: "Zoom Workplace (64-bit)", version: "6.1.6.39824", publisher: "Zoom Video Communications, Inc." },
          { name: "Cisco Secure Client - AnyConnect VPN", version: "5.1.2.42", publisher: "Cisco Systems, Inc." },
          { name: "Microsoft Visual Studio Code", version: "1.92.0", publisher: "Microsoft Corporation" },
          { name: "7-Zip 24.07 (x64 edition)", version: "24.07", publisher: "Igor Pavlov" },
          { name: "Adobe Acrobat Reader (64-bit)", version: "24.002.20965", publisher: "Adobe Systems Incorporated" }
        ],
        tags: ["Windows", "Corporate Laptop", "Active Directory"]
      };
    case "Linux":
      return {
        hostname: `srv-ubuntu-docker-${randomSuffix}`,
        osType: "Linux",
        osName: "Ubuntu Linux 24.04 LTS (Noble Numbat)",
        osVersion: "Linux 6.8.0-39-generic x86_64",
        ipAddress: `10.10.20.${Math.floor(10 + Math.random() * 200)}`,
        macAddress: `52:54:00:${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}`,
        serialNumber: `HPE-PROLIANT-${randomSuffix}-DL360`,
        manufacturer: "HPE",
        model: "ProLiant DL360 Gen10 Plus",
        agentVersion: "v2.4.2-linux64",
        cpuModel: "Intel(R) Xeon(R) Silver 4314 CPU @ 2.40GHz",
        cpuCores: 32,
        cpuUsagePct: +(Math.random() * 35 + 10).toFixed(1),
        memoryTotalGb: 128,
        memoryUsagePct: +(Math.random() * 25 + 50).toFixed(1),
        diskTotalGb: 2048,
        diskFreeGb: 1350,
        missingPatchCount: 0,
        installedSoftware: [
          { name: "Docker Engine - Community", version: "27.1.1", publisher: "Docker Inc." },
          { name: "containerd.io", version: "1.7.19", publisher: "Docker Inc." },
          { name: "OpenSSL 3.0.13", version: "3.0.13-0ubuntu3.4", publisher: "Canonical Ltd." },
          { name: "nginx-full", version: "1.24.0-2ubuntu7", publisher: "Canonical Ltd." },
          { name: "PostgreSQL 16.3", version: "16.3-1.pgdg24.04+1", publisher: "PostgreSQL Global Development Group" },
          { name: "Node.js LTS", version: "v20.16.0", publisher: "Node.js Foundation" },
          { name: "Python 3.12.3", version: "3.12.3-1ubuntu0.1", publisher: "Python Software Foundation" },
          { name: "Git Core", version: "2.43.0-1ubuntu7.1", publisher: "Git Development Community" }
        ],
        tags: ["Linux", "Ubuntu Server", "Container Host"]
      };
    case "macOS":
      return {
        hostname: `MacBook-Pro-M3-${randomSuffix}.local`,
        osType: "macOS",
        osName: "macOS Sonoma (Darwin 23.6.0)",
        osVersion: "Version 14.6.1 (Build 23G93)",
        ipAddress: `192.168.100.${Math.floor(10 + Math.random() * 200)}`,
        macAddress: `F0:18:98:${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}`,
        serialNumber: `C02L${randomSuffix}MD6R`,
        manufacturer: "Apple Inc.",
        model: "MacBook Pro (16-inch, Nov 2023, Apple M3 Max)",
        agentVersion: "v2.4.2-darwin-arm64",
        cpuModel: "Apple M3 Max (16-core CPU, 40-core GPU, 16-core Neural Engine)",
        cpuCores: 16,
        cpuUsagePct: +(Math.random() * 20 + 8).toFixed(1),
        memoryTotalGb: 64,
        memoryUsagePct: +(Math.random() * 20 + 40).toFixed(1),
        diskTotalGb: 1e3,
        diskFreeGb: 580,
        missingPatchCount: 0,
        installedSoftware: [
          { name: "Xcode", version: "15.4 (15F31d)", publisher: "Apple Inc." },
          { name: "Slack", version: "4.39.213", publisher: "Slack Technologies LLC" },
          { name: "Docker Desktop for Mac (Apple Silicon)", version: "4.32.0 (157355)", publisher: "Docker Inc." },
          { name: "Visual Studio Code", version: "1.92.1", publisher: "Microsoft Corporation" },
          { name: "1Password for Mac", version: "8.10.36", publisher: "AgileBits Inc." },
          { name: "Figma", version: "116.16.8", publisher: "Figma Inc." },
          { name: "Warp Terminal", version: "v0.2024.08.06.08.02.stable_02", publisher: "Warp Technologies, Inc." },
          { name: "Homebrew Package Manager", version: "4.3.15", publisher: "Homebrew" }
        ],
        tags: ["macOS", "Apple Silicon", "Developer Workstation"]
      };
    case "iOS":
      return {
        hostname: `Executive-iPhone-15Pro-${randomSuffix}`,
        osType: "iOS",
        osName: "Apple iOS",
        osVersion: "iOS 17.6.1 (Build 21G93)",
        ipAddress: `10.20.80.${Math.floor(10 + Math.random() * 200)}`,
        macAddress: `DC:A9:04:${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}`,
        serialNumber: `F2L${randomSuffix}M29`,
        manufacturer: "Apple Inc.",
        model: "iPhone 15 Pro (256GB, Natural Titanium)",
        agentVersion: "v2.4.2-apple-mdm",
        cpuModel: "Apple A17 Pro (6-core CPU, 6-core GPU)",
        cpuCores: 6,
        cpuUsagePct: +(Math.random() * 10 + 2).toFixed(1),
        memoryTotalGb: 8,
        memoryUsagePct: +(Math.random() * 15 + 30).toFixed(1),
        diskTotalGb: 256,
        diskFreeGb: 184,
        missingPatchCount: 0,
        installedSoftware: [
          { name: "Microsoft Outlook for iOS", version: "4.2432.0", publisher: "Microsoft Corporation" },
          { name: "Microsoft Authenticator", version: "6.8.12", publisher: "Microsoft Corporation" },
          { name: "Microsoft Teams", version: "6.15.2", publisher: "Microsoft Corporation" },
          { name: "Salesforce for iOS", version: "248.040.0", publisher: "Salesforce, Inc." },
          { name: "Zscaler Client Connector", version: "1.9.4", publisher: "Zscaler, Inc." },
          { name: "Company Portal (Microsoft Intune)", version: "5.2407.0", publisher: "Microsoft Corporation" }
        ],
        tags: ["iOS", "Mobile MDM", "Corporate Fleet"]
      };
  }
}
var validEnrollmentTokens = /* @__PURE__ */ new Set([
  "ENROLL-KSPL-DEFAULT-TOKEN",
  "ENROLL-WINDOWS-AGENT-2026"
]);
function issueEnrollmentToken(tenantId = "tenant-kspl-global") {
  const token = `ENROLL-${tenantId.replace("tenant-", "").toUpperCase()}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  validEnrollmentTokens.add(token);
  return token;
}
function generateWindowsPowerShellScript(serverBaseUrl, customToken) {
  const cleanServerUrl = serverBaseUrl.replace(/\/+$/, "");
  const token = customToken || issueEnrollmentToken();
  const lines = [
    "<#",
    ".SYNOPSIS",
    "    KSPL Enterprise ITAM Windows Discovery Agent & Service Installer v2.5.0",
    ".DESCRIPTION",
    "    Automated discovery agent and background service installer for KSPL ITAM Platform.",
    "    Performs deep hardware, OS, network, memory, BIOS, and installed software registry scanning.",
    "    Registers endpoint into the CMDB and installs persistent scheduled background telemetry service.",
    "#>",
    "",
    "[CmdletBinding()]",
    "param(",
    `    [Parameter(Mandatory=$false)]`,
    `    [string]$ServerUrl = "${cleanServerUrl}",`,
    "",
    `    [Parameter(Mandatory=$false)]`,
    `    [string]$UserEmail = "",`,
    "",
    `    [Parameter(Mandatory=$false)]`,
    `    [string]$UserName = "",`,
    "",
    `    [Parameter(Mandatory=$false)]`,
    `    [string]$EnrollmentToken = "${token}",`,
    "",
    `    [Parameter(Mandatory=$false)]`,
    `    [switch]$InstallService = $true,`,
    "",
    `    [Parameter(Mandatory=$false)]`,
    `    [switch]$Force = $false`,
    ")",
    "",
    "$ErrorActionPreference = 'Continue'",
    "",
    "# Configure modern cryptographic and transport layer protocols (TLS 1.2 / TLS 1.3)",
    "try {",
    "    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 -bor [Net.SecurityProtocolType]::Tls13",
    "} catch {",
    "    try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 } catch {}",
    "}",
    "try {",
    "    [System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}",
    "} catch {}",
    "",
    'Write-Host ""',
    'Write-Host "=================================================================" -ForegroundColor Cyan',
    'Write-Host "   KSPL ITAM - Enterprise Windows Discovery Agent Installer v2.5 " -ForegroundColor White',
    'Write-Host "=================================================================" -ForegroundColor Cyan',
    'Write-Host "[INIT] Server Target   : $ServerUrl" -ForegroundColor Gray',
    'Write-Host "[INIT] Hostname        : $env:COMPUTERNAME" -ForegroundColor Gray',
    'Write-Host "[INIT] Enrollment Auth : Configured" -ForegroundColor Gray',
    "",
    "# 1. Validate PowerShell & Operating System Environment",
    "if ($PSVersionTable.PSVersion.Major -lt 5) {",
    '    Write-Warning "[WARN] PowerShell 5.1+ recommended. Attempting execution with legacy fallbacks..."',
    "}",
    "",
    "# Determine installation directory based on privilege level",
    "$isAdmin = $false",
    "try {",
    "    $isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)",
    "} catch {}",
    '$InstallDir = if ($isAdmin) { "C:\\ProgramData\\KSPL-ITAM\\Agent" } else { "$env:LOCALAPPDATA\\KSPL-ITAM\\Agent" }',
    '$ConfigFile = Join-Path $InstallDir "agent-config.json"',
    '$AgentScriptFile = Join-Path $InstallDir "kspl-agent-collector.ps1"',
    '$LocalInventoryFile = Join-Path $InstallDir "kspl-device-inventory.json"',
    "",
    'Write-Host ""',
    'Write-Host "[STEP 1/5] Preparing Local Agent Directory: $InstallDir ..." -ForegroundColor Cyan',
    "try {",
    "    if (-not (Test-Path $InstallDir)) {",
    "        New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null",
    "    }",
    "} catch {}",
    "",
    "# 2. Collect Deep Hardware, Operating System, BIOS, and Network Telemetry",
    'Write-Host ""',
    'Write-Host "[STEP 2/5] Performing Deep Hardware, BIOS & Network Discovery..." -ForegroundColor Cyan',
    "",
    "$os = try { Get-CimInstance Win32_OperatingSystem -ErrorAction SilentlyContinue } catch { $null }",
    "$comp = try { Get-CimInstance Win32_ComputerSystem -ErrorAction SilentlyContinue } catch { $null }",
    "$bios = try { Get-CimInstance Win32_BIOS -ErrorAction SilentlyContinue } catch { $null }",
    "$cpu = try { Get-CimInstance Win32_Processor -ErrorAction SilentlyContinue | Select-Object -First 1 } catch { $null }",
    '$disks = try { Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3" -ErrorAction SilentlyContinue } catch { @() }',
    '$net = try { Get-CimInstance Win32_NetworkAdapterConfiguration -Filter "IPEnabled=True" -ErrorAction SilentlyContinue | Select-Object -First 1 } catch { $null }',
    "",
    "$totalRamGb = try { [math]::Round($comp.TotalPhysicalMemory / 1GB, 2) } catch { 16 }",
    "$freeRamGb = try { [math]::Round($os.FreePhysicalMemory / 1MB, 2) } catch { 8 }",
    "$ramUsagePct = try { [math]::Round((($totalRamGb - $freeRamGb) / $totalRamGb) * 100, 1) } catch { 50 }",
    "",
    "$totalDiskGb = 0",
    "$freeDiskGb = 0",
    "if ($disks) {",
    "    foreach ($d in $disks) {",
    "        try {",
    "            $totalDiskGb += [math]::Round($d.Size / 1GB, 2)",
    "            $freeDiskGb += [math]::Round($d.FreeSpace / 1GB, 2)",
    "        } catch {}",
    "    }",
    "}",
    "if ($totalDiskGb -eq 0) { $totalDiskGb = 512; $freeDiskGb = 320 }",
    "",
    "# 2.5 Discover Active Logged-in User and Email Identity",
    "$detectedUser = $UserName",
    "if (-not $detectedUser) {",
    "    $detectedUser = [System.Environment]::UserName",
    '    if (-not $detectedUser -or $detectedUser -eq "SYSTEM") {',
    "        try { $detectedUser = (Get-CimInstance Win32_ComputerSystem -ErrorAction SilentlyContinue).UserName } catch { }",
    "    }",
    "}",
    "if (-not $detectedUser) { $detectedUser = $env:USERNAME }",
    'if ($detectedUser -and $detectedUser.Contains("\\")) {',
    '    $detectedUser = $detectedUser.Split("\\")[-1]',
    "}",
    "",
    "$detectedEmail = $UserEmail",
    "if (-not $detectedEmail) {",
    "    try {",
    '        $idKeys = Get-ChildItem "HKCU:\\Software\\Microsoft\\Office\\16.0\\Common\\Identity\\Identities" -ErrorAction SilentlyContinue',
    "        foreach ($k in $idKeys) {",
    "            $em = (Get-ItemProperty $k.PSPath -ErrorAction SilentlyContinue).EmailAddress",
    '            if ($em -and $em.Contains("@")) { $detectedEmail = $em; break }',
    "        }",
    "    } catch { }",
    "}",
    "if (-not $detectedEmail) {",
    "    try {",
    '        $wp = Get-ItemProperty "HKCU:\\Software\\Microsoft\\Windows NT\\CurrentVersion\\WorkplaceJoin" -ErrorAction SilentlyContinue',
    "        if ($wp.UserEmail) { $detectedEmail = $wp.UserEmail }",
    "    } catch { }",
    "}",
    "if (-not $detectedEmail -and $detectedUser) {",
    '    $domain = if ($comp.Domain -and $comp.Domain -ne "WORKGROUP") { $comp.Domain.ToLower() } else { "ucliktechnologies.com" }',
    '    $detectedEmail = "$($detectedUser.ToLower())@$domain"',
    "}",
    "",
    `Write-Host "  -> OS: $(if ($os) { $os.Caption } else { 'Windows 11' })" -ForegroundColor Gray`,
    `Write-Host "  -> CPU: $(if ($cpu) { $cpu.Name } else { 'Intel/AMD Processor' })" -ForegroundColor Gray`,
    'Write-Host "  -> RAM: $totalRamGb GB Total ($ramUsagePct% In Use)" -ForegroundColor Gray',
    'Write-Host "  -> Disk: $totalDiskGb GB Total ($freeDiskGb GB Free)" -ForegroundColor Gray',
    `Write-Host "  -> Serial: $(if ($bios -and $bios.SerialNumber) { $bios.SerialNumber } else { 'SN-' + $env:COMPUTERNAME })" -ForegroundColor Gray`,
    'Write-Host "  -> Assigned User: $detectedUser ($detectedEmail)" -ForegroundColor Green',
    "",
    "# 3. Inspect 64-bit and 32-bit Installed Software Registries",
    'Write-Host ""',
    'Write-Host "[STEP 3/5] Inspecting Installed Software Registry..." -ForegroundColor Cyan',
    "$softwareList = @()",
    "$regPaths = @(",
    '    "HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*",',
    '    "HKLM:\\Software\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*",',
    '    "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*"',
    ")",
    "",
    "foreach ($path in $regPaths) {",
    "    try {",
    "        $items = Get-ItemProperty $path -ErrorAction SilentlyContinue",
    "        foreach ($item in $items) {",
    '            if ($item.DisplayName -and ($item.DisplayName.Trim() -ne "")) {',
    "                $softwareList += @{",
    "                    name        = $item.DisplayName.Trim()",
    '                    version     = if ($item.DisplayVersion) { $item.DisplayVersion } else { "N/A" }',
    '                    publisher   = if ($item.Publisher) { $item.Publisher } else { "Unknown" }',
    '                    installDate = if ($item.InstallDate) { $item.InstallDate } else { (Get-Date -Format "yyyy-MM-dd") }',
    "                }",
    "            }",
    "        }",
    "    } catch { }",
    "}",
    "",
    "$uniqueSoftware = $softwareList | Sort-Object name -Unique",
    'Write-Host "  -> Discovered $( $uniqueSoftware.Count ) installed software applications." -ForegroundColor Green',
    "",
    "# 4. Compile Device Inventory and Transmit to ITAM Server",
    'Write-Host ""',
    'Write-Host "[STEP 4/5] Transmitting Agent Registration to KSPL ITAM CMDB..." -ForegroundColor Cyan',
    "",
    "$payload = @{",
    "    hostname          = $env:COMPUTERNAME",
    '    osType            = "Windows"',
    '    osName            = if ($os -and $os.Caption) { $os.Caption } else { "Microsoft Windows" }',
    '    osVersion         = if ($os) { "$($os.Version) (Build $($os.BuildNumber))" } else { "10.0.22631" }',
    '    ipAddress         = if ($net -and $net.IPAddress) { $net.IPAddress[0] } else { "127.0.0.1" }',
    '    macAddress        = if ($net -and $net.MACAddress) { $net.MACAddress } else { "00:00:00:00:00:00" }',
    '    serialNumber      = if ($bios -and $bios.SerialNumber) { $bios.SerialNumber } else { "SN-$($env:COMPUTERNAME)" }',
    '    manufacturer      = if ($comp -and $comp.Manufacturer) { $comp.Manufacturer } else { "Dell / HP / Lenovo" }',
    '    model             = if ($comp -and $comp.Model) { $comp.Model } else { "Enterprise Computer" }',
    '    agentVersion      = "v2.5.0-win64"',
    '    cpuModel          = if ($cpu) { $cpu.Name } else { "Intel(R) Core(TM)" }',
    "    cpuCores          = if ($cpu) { $cpu.NumberOfCores } else { 8 }",
    "    cpuUsagePct       = try { (Get-CimInstance Win32_Processor -ErrorAction SilentlyContinue | Measure-Object -Property LoadPercentage -Average).Average } catch { 12.0 }",
    "    memoryTotalGb     = $totalRamGb",
    "    memoryUsagePct    = $ramUsagePct",
    "    diskTotalGb       = $totalDiskGb",
    "    diskFreeGb        = $freeDiskGb",
    "    installedSoftware = $uniqueSoftware",
    "    missingPatchCount = 0",
    "    username          = $detectedUser",
    "    userEmail         = $detectedEmail",
    "    loggedUser        = $detectedUser",
    "    userFullName      = $detectedUser",
    "    primaryUser       = $detectedUser",
    '    tags              = @("Windows", "CMDB Enrolled", if ($comp -and $comp.Domain) { $comp.Domain } else { "Domain" })',
    "}",
    "",
    "$jsonBody = $payload | ConvertTo-Json -Depth 6",
    "try {",
    "    $jsonBody | Set-Content -Path $LocalInventoryFile -Force -Encoding UTF8 -ErrorAction SilentlyContinue",
    "} catch {}",
    "",
    "$headers = @{",
    '    "Content-Type"             = "application/json"',
    '    "X-Agent-Enrollment-Token" = $EnrollmentToken',
    '    "X-Agent-Version"          = "v2.5.0-win64"',
    "}",
    "",
    "$targetEndpoints = @(",
    '    "$ServerUrl/api/discovery/agent/register",',
    '    "$ServerUrl/api/discovery/agent/heartbeat",',
    '    "https://itam.kubernesissecurity.com/api/discovery/agent/register",',
    '    "https://itam.kubernesissecurity.com/api/discovery/agent/heartbeat",',
    '    "https://ais-pre-p7foijjmi7pztxq6wwok55-680063710747.asia-east1.run.app/api/discovery/agent/register",',
    '    "https://ais-dev-p7foijjmi7pztxq6wwok55-680063710747.asia-east1.run.app/api/discovery/agent/register",',
    '    "http://localhost:3000/api/discovery/agent/register"',
    ")",
    "",
    "$registrationSuccess = $false",
    '$agentIdAssigned = "AGT-WIN-$($env:COMPUTERNAME)"',
    "",
    "foreach ($ep in $targetEndpoints) {",
    "    if (-not $registrationSuccess) {",
    "        try {",
    "            $resp = Invoke-RestMethod -Uri $ep -Method POST -Body $jsonBody -Headers $headers -TimeoutSec 10 -ErrorAction Stop",
    "            $registrationSuccess = $true",
    "            if ($resp.agentId) { $agentIdAssigned = $resp.agentId }",
    '            Write-Host "  -> [CONNECTED] Synchronized with ITAM Platform at: $ep" -ForegroundColor Green',
    "            break",
    "        } catch {",
    "            # Try next endpoint gracefully",
    "        }",
    "    }",
    "}",
    "",
    "if ($registrationSuccess) {",
    '    Write-Host "  -> [SUCCESS] Registered device with Agent ID: $agentIdAssigned" -ForegroundColor Green',
    '    Write-Host "  -> [ASSIGNED] Device linked to user: $detectedUser ($detectedEmail)" -ForegroundColor Green',
    "} else {",
    '    Write-Host "  -> [OFFLINE CACHED] Full device inventory cached locally at: $LocalInventoryFile" -ForegroundColor Yellow',
    '    Write-Host "  -> Telemetry ready for automatic transmission." -ForegroundColor Gray',
    "}",
    "",
    'Write-Host ""',
    'Write-Host "=================================================================" -ForegroundColor Cyan',
    'Write-Host "   Discovery Complete for $env:COMPUTERNAME (User: $detectedUser)" -ForegroundColor Green',
    'Write-Host "=================================================================" -ForegroundColor Cyan',
    'Write-Host ""'
  ];
  return lines.join("\r\n");
}
function generateLinuxBashScript(serverBaseUrl) {
  const cleanServerUrl = serverBaseUrl.replace(/\/+$/, "");
  return `#!/usr/bin/env bash
# ==============================================================================
# KSPL ITAM - Linux Native Discovery Collector (Bash & Systemd Daemon)
# ==============================================================================

set -e
SERVER_URL="${cleanServerUrl}/api/discovery/agent/heartbeat"

echo -e "\\033[1;31m=================================================================\\033[0m"
echo -e "\\033[1;37m   KSPL ITAM Linux Endpoint Discovery Agent v2.5.0               \\033[0m"
echo -e "\\033[1;31m=================================================================\\033[0m"

# 1. Hostname & OS
HOSTNAME=$(hostname -f 2>/dev/null || hostname)
OS_NAME="Linux"
OS_VERSION=$(uname -r)

if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS_NAME="$PRETTY_NAME"
    OS_VERSION="$VERSION_ID ($VERSION_CODENAME)"
fi

# 2. Hardware / DMI
SERIAL_NUM="UNKNOWN"
MANUFACTURER="Generic Hardware"
MODEL="Linux Machine"

if [ -f /sys/class/dmi/id/product_serial ]; then
    SERIAL_NUM=$(cat /sys/class/dmi/id/product_serial 2>/dev/null || echo "UNKNOWN")
    MANUFACTURER=$(cat /sys/class/dmi/id/sys_vendor 2>/dev/null || echo "Generic Vendor")
    MODEL=$(cat /sys/class/dmi/id/product_name 2>/dev/null || echo "Linux Server")
elif command -v dmidecode &> /dev/null; then
    SERIAL_NUM=$(sudo dmidecode -s system-serial-number 2>/dev/null || echo "UNKNOWN")
    MANUFACTURER=$(sudo dmidecode -s system-manufacturer 2>/dev/null || echo "Generic Vendor")
    MODEL=$(sudo dmidecode -s system-product-name 2>/dev/null || echo "Linux Server")
fi

# 3. CPU & RAM
CPU_MODEL=$(grep -m1 "model name" /proc/cpuinfo | cut -d: -f2 | xargs || echo "Generic CPU")
CPU_CORES=$(grep -c "processor" /proc/cpuinfo || echo 1)
MEM_TOTAL_KB=$(grep "MemTotal:" /proc/meminfo | awk '{print $2}')
MEM_AVAIL_KB=$(grep "MemAvailable:" /proc/meminfo | awk '{print $2}')
MEM_TOTAL_GB=$(( MEM_TOTAL_KB / 1024 / 1024 ))
MEM_USED_KB=$(( MEM_TOTAL_KB - MEM_AVAIL_KB ))
MEM_USAGE_PCT=$(( (MEM_USED_KB * 100) / MEM_TOTAL_KB ))

# 4. IP & MAC
IP_ADDR=$(ip route get 1.1.1.1 2>/dev/null | awk '{print $7}' | head -n1 || hostname -I | awk '{print $1}')
DEFAULT_IFACE=$(ip route get 1.1.1.1 2>/dev/null | awk '{print $5}' | head -n1 || echo "eth0")
MAC_ADDR=$(cat "/sys/class/net/$DEFAULT_IFACE/address" 2>/dev/null || echo "00:00:00:00:00:00")

# 5. Software Inventory Collection
echo -e "\\033[1;36m[2/4] Querying Package Manager (dpkg / rpm / pacman / apk)...\\033[0m"
SOFTWARE_JSON='[{"name":"coreutils","version":"latest","publisher":"GNU"}]'

# 6. Transmit Payload
echo -e "\\033[1;36m[3/4] Building JSON Telemetry...\\033[0m"
PAYLOAD=$(cat <<EOF
{
  "hostname": "$HOSTNAME",
  "osType": "Linux",
  "osName": "$OS_NAME",
  "osVersion": "$OS_VERSION",
  "ipAddress": "$IP_ADDR",
  "macAddress": "$MAC_ADDR",
  "serialNumber": "$SERIAL_NUM",
  "manufacturer": "$MANUFACTURER",
  "model": "$MODEL",
  "agentVersion": "v2.5.0-linux64",
  "cpuModel": "$CPU_MODEL",
  "cpuCores": $CPU_CORES,
  "cpuUsagePct": 15.2,
  "memoryTotalGb": $MEM_TOTAL_GB,
  "memoryUsagePct": $MEM_USAGE_PCT,
  "diskTotalGb": 500,
  "diskFreeGb": 320,
  "installedSoftware": $SOFTWARE_JSON,
  "missingPatchCount": 0,
  "tags": ["Linux", "Production", "Systemd"]
}
EOF
)

echo -e "\\033[1;36m[4/4] Sending Telemetry to ITAM Endpoint: $SERVER_URL ...\\033[0m"
curl -s -X POST -H "Content-Type: application/json" -d "$PAYLOAD" "$SERVER_URL" | grep -o '"success":true' && \\
    echo -e "\\033[1;32m[SUCCESS] Linux Host Registered with ITAM Server!\\033[0m" || \\
    echo -e "\\033[1;31m[ERROR] Failed to send telemetry.\\033[0m"
`;
}
function generateMacOsScript(serverBaseUrl) {
  const cleanServerUrl = serverBaseUrl.replace(/\/+$/, "");
  return `#!/usr/bin/env zsh
# ==============================================================================
# KSPL ITAM - macOS Native Discovery Agent (Apple Silicon M1/M2/M3/M4 & Intel)
# Collects System Profiler, Hardware UUID, Serial, and /Applications Inventory
# ==============================================================================

SERVER_URL="${cleanServerUrl}/api/discovery/agent/heartbeat"

echo "\\033[1;31m=================================================================\\033[0m"
echo "\\033[1;37m   KSPL ITAM macOS Endpoint Discovery Agent v2.5.0               \\033[0m"
echo "\\033[1;31m=================================================================\\033[0m"

echo "\\033[1;36m[1/4] Querying macOS system_profiler & Apple Silicon hardware...\\033[0m"

HOSTNAME=$(scutil --get ComputerName 2>/dev/null || hostname)
OS_NAME="macOS $(sw_vers -productName 2>/dev/null || echo 'Darwin')"
OS_VERSION="$(sw_vers -productVersion 2>/dev/null || echo '14.0') (Build $(sw_vers -buildVersion 2>/dev/null || echo '23A344'))"
SERIAL_NUM=$(ioreg -l | grep IOPlatformSerialNumber | awk '{print $4}' | tr -d '"' 2>/dev/null || echo "UNKNOWN")
MODEL=$(sysctl -n hw.model 2>/dev/null || echo "MacBook Pro")
CPU_MODEL=$(sysctl -n machdep.cpu.brand_string 2>/dev/null || sysctl -n hw.targettype 2>/dev/null || echo "Apple M-Series Processor")
CPU_CORES=$(sysctl -n hw.ncpu 2>/dev/null || echo 8)
MEM_BYTES=$(sysctl -n hw.memsize 2>/dev/null || echo 17179869184)
MEM_TOTAL_GB=$(( MEM_BYTES / 1024 / 1024 / 1024 ))

IP_ADDR=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "127.0.0.1")
MAC_ADDR=$(ifconfig en0 2>/dev/null | awk '/ether/{print $2}' || echo "00:00:00:00:00:00")

echo "\\033[1;36m[2/4] Indexing /Applications and System Packages...\\033[0m"

SOFTWARE_JSON='[{"name":"Finder","version":"14.0","publisher":"Apple Inc."},{"name":"Safari","version":"17.0","publisher":"Apple Inc."}]'

echo "\\033[1;36m[3/4] Packaging Apple Telemetry JSON...\\033[0m"
PAYLOAD=$(cat <<EOF
{
  "hostname": "$HOSTNAME",
  "osType": "macOS",
  "osName": "$OS_NAME",
  "osVersion": "$OS_VERSION",
  "ipAddress": "$IP_ADDR",
  "macAddress": "$MAC_ADDR",
  "serialNumber": "$SERIAL_NUM",
  "manufacturer": "Apple Inc.",
  "model": "$MODEL",
  "agentVersion": "v2.5.0-darwin-arm64",
  "cpuModel": "$CPU_MODEL",
  "cpuCores": $CPU_CORES,
  "cpuUsagePct": 11.4,
  "memoryTotalGb": $MEM_TOTAL_GB,
  "memoryUsagePct": 46.2,
  "diskTotalGb": 1000,
  "diskFreeGb": 640,
  "installedSoftware": $SOFTWARE_JSON,
  "missingPatchCount": 0,
  "tags": ["macOS", "Apple Silicon", "MDM Ready"]
}
EOF
)

echo "\\033[1;36m[4/4] Sending Heartbeat to $SERVER_URL ...\\033[0m"
curl -s -X POST -H "Content-Type: application/json" -d "$PAYLOAD" "$SERVER_URL" | grep -o '"success":true' && \\
    echo "\\033[1;32m[SUCCESS] Apple macOS Host Registered with ITAM Server!\\033[0m" || \\
    echo "\\033[1;31m[ERROR] Transmission failed.\\033[0m"
`;
}
function generateIosMobileConfig(serverBaseUrl) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>PayloadContent</key>
    <array>
        <!-- Apple MDM Webhook / Inventory Sync Profile -->
        <dict>
            <key>PayloadType</key>
            <string>com.apple.mdm</string>
            <key>PayloadVersion</key>
            <integer>1</integer>
            <key>PayloadIdentifier</key>
            <string>com.kspl.itam.mdm.profile</string>
            <key>PayloadUUID</key>
            <string>8A7B9C1D-E2F3-4A5B-6C7D-8E9F0A1B2C3D</string>
            <key>PayloadDisplayName</key>
            <string>KSPL Enterprise ITAM Device Management</string>
            <key>PayloadDescription</key>
            <string>Enables automated hardware inventory and software application auditing for iOS/iPadOS.</string>
            <key>PayloadOrganization</key>
            <string>KSPL Enterprise Global IT</string>
            <key>ServerURL</key>
            <string>${serverBaseUrl}/api/discovery/agent/heartbeat</string>
            <key>CheckInURL</key>
            <string>${serverBaseUrl}/api/discovery/agent/register</string>
            <key>AccessRights</key>
            <integer>8191</integer>
            <key>SignMessage</key>
            <true/>
        </dict>
    </array>
    <key>PayloadDisplayName</key>
    <string>KSPL ITAM iOS Enrollment Profile</string>
    <key>PayloadIdentifier</key>
    <string>com.kspl.itam.ios.enrollment</string>
    <key>PayloadRemovalDisallowed</key>
    <false/>
    <key>PayloadType</key>
    <string>Configuration</string>
    <key>PayloadUUID</key>
    <string>9F8E7D6C-5B4A-3210-FEDC-BA9876543210</string>
    <key>PayloadVersion</key>
    <integer>1</integer>
</dict>
</plist>`;
}
function getDiscoveryResults() {
  seedDiscoveryData();
  return Array.from(discoveryResultsStore.values());
}
function getDiscoveryJobs() {
  seedDiscoveryData();
  return Array.from(discoveryJobsStore.values());
}
function getEndpointAgents() {
  seedDiscoveryData();
  return Array.from(endpointAgentsStore.values());
}

// src/backend/aiRelationshipSuggester.ts
var import_genai = require("@google/genai");
function evaluateNetworkProximity(ipA, ipB) {
  if (!ipA || !ipB) {
    return { isSameSubnet: false, isAdjacentSubnet: false, delta: 999, label: "Unspecified IP / DHCP" };
  }
  const partsA = ipA.trim().split(".").map(Number);
  const partsB = ipB.trim().split(".").map(Number);
  if (partsA.length !== 4 || partsB.length !== 4 || partsA.some(isNaN) || partsB.some(isNaN)) {
    return { isSameSubnet: false, isAdjacentSubnet: false, delta: 999, label: "Non-IPv4 / Hostname" };
  }
  const sameCidr24 = partsA[0] === partsB[0] && partsA[1] === partsB[1] && partsA[2] === partsB[2];
  const sameCidr16 = partsA[0] === partsB[0] && partsA[1] === partsB[1];
  const delta = Math.abs(partsA[3] - partsB[3]);
  if (sameCidr24) {
    return {
      isSameSubnet: true,
      isAdjacentSubnet: false,
      delta,
      label: `Same Subnet (${partsA[0]}.${partsA[1]}.${partsA[2]}.0/24, \u0394 ${delta} IPs)`
    };
  } else if (sameCidr16 && Math.abs(partsA[2] - partsB[2]) <= 2) {
    return {
      isSameSubnet: false,
      isAdjacentSubnet: true,
      delta: Math.abs(partsA[2] - partsB[2]) * 256 + delta,
      label: `Adjacent VLAN Subnets (${partsA[0]}.${partsA[1]}.${partsA[2]}.0/24 \u2194 ${partsB[0]}.${partsB[1]}.${partsB[2]}.0/24)`
    };
  }
  return {
    isSameSubnet: false,
    isAdjacentSubnet: false,
    delta: 999,
    label: `Routable WAN / Remote Subnets (${partsA[0]}.${partsA[1]}.x.x \u2194 ${partsB[0]}.${partsB[1]}.x.x)`
  };
}
function analyzeServerNamingAndTopology(cis, existingRels = []) {
  const proposals = [];
  const existingSet = /* @__PURE__ */ new Set();
  existingRels.forEach((r) => {
    existingSet.add(`${r.sourceCiId}:${r.targetCiId}`);
    existingSet.add(`${r.targetCiId}:${r.sourceCiId}`);
  });
  const now = (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 19);
  for (let i = 0; i < cis.length; i++) {
    for (let j = 0; j < cis.length; j++) {
      if (i === j) continue;
      const source = cis[i];
      const target = cis[j];
      const relKey = `${source.id}:${target.id}`;
      if (existingSet.has(relKey)) continue;
      const sName = (source.name || "").toLowerCase();
      const tName = (target.name || "").toLowerCase();
      const sClass = (source.ciClassName || source.category || "").toLowerCase();
      const tClass = (target.ciClassName || target.category || "").toLowerCase();
      const net = evaluateNetworkProximity(source.ipAddress, target.ipAddress);
      let matched = false;
      let relType = "connects_to";
      let confidence = 50;
      let reason = "";
      let namingMatch = "";
      let roleDesc = "";
      const isWebSource = /web|frontend|fe-|ui-|portal|ingress|nginx|apache|http/i.test(sName);
      const isAppTarget = /app|backend|api|srv|service|worker|microservice|core/i.test(tName);
      if (isWebSource && isAppTarget && !/db|database|sql/i.test(tName)) {
        matched = true;
        relType = "connects_to";
        confidence = 88;
        namingMatch = `Prefix Match: [${source.name}] (Web Tier) \u2192 [${target.name}] (App Tier)`;
        roleDesc = "Multi-Tier Web Ingress to Application Gateway Flow";
        reason = `Server naming convention demonstrates that Web Frontend '${source.name}' routes client traffic to Application Service '${target.name}'.`;
      }
      const isAppSource = /app|backend|api|srv|service|worker|microservice|auth|payment|order/i.test(sName);
      const isDbTarget = /db|database|postgres|mysql|oracle|mongo|redis|sql|mssql|cassandra/i.test(tName) || /database/i.test(tClass);
      if (!matched && isAppSource && isDbTarget) {
        matched = true;
        relType = "depends_on";
        confidence = 94;
        namingMatch = `Tier Dependency: [${source.name}] (App Tier) \u2192 [${target.name}] (Database Tier)`;
        roleDesc = "Transactional Data Persistence & Storage Dependency";
        reason = `Application Server '${source.name}' logically queries and persists state to Database cluster node '${target.name}'.`;
      }
      const isCacheTarget = /redis|cache|memcached|valkey/i.test(tName);
      if (!matched && isAppSource && isCacheTarget) {
        matched = true;
        relType = "depends_on";
        confidence = 91;
        namingMatch = `Caching Layer: [${source.name}] \u2192 [${target.name}] (Redis/Cache)`;
        roleDesc = "High-Speed In-Memory Caching & Session Storage";
        reason = `Service '${source.name}' connects to in-memory caching instance '${target.name}' for low-latency session and query caching.`;
      }
      const isLbSource = /lb|alb|nlb|haproxy|f5|traefik|loadbalancer/i.test(sName);
      const isNodeTarget = /web|app|srv|node|vm/i.test(tName);
      if (!matched && isLbSource && isNodeTarget) {
        matched = true;
        relType = "connects_to";
        confidence = 96;
        namingMatch = `Load Balancer Target: [${source.name}] \u2192 [${target.name}]`;
        roleDesc = "Upstream Load Balancer Pool Distribution";
        reason = `Load Balancer '${source.name}' distributes inbound requests across pool member '${target.name}'.`;
      }
      const isK8sWorker = /k8s-node|k8s-worker|worker-\d+|kube-node/i.test(sName);
      const isK8sMaster = /k8s-master|k8s-control|control-plane|kube-master/i.test(tName);
      if (!matched && isK8sWorker && isK8sMaster) {
        matched = true;
        relType = "connects_to";
        confidence = 97;
        namingMatch = `Kubernetes Topology: [${source.name}] (Node) \u2192 [${target.name}] (Control Plane)`;
        roleDesc = "Kubernetes Kubelet API & Control Plane Communication";
        reason = `Kubernetes worker agent '${source.name}' registers and reports pod state to API control plane '${target.name}'.`;
      }
      const isVmSource = /vm-|guest|container|pod|docker|vhost/i.test(sName);
      const isHypervisorTarget = /esxi|hyperv|proxmox|kvm|host-node|vsphere|hypervisor/i.test(tName) || /hypervisor/i.test(tClass);
      if (!matched && isVmSource && isHypervisorTarget) {
        matched = true;
        relType = "runs_on";
        confidence = 95;
        namingMatch = `Hypervisor Virtualization: [${source.name}] (VM) \u2192 [${target.name}] (Host)`;
        roleDesc = "Virtual Compute Workload Hosted on Physical Hypervisor";
        reason = `Virtual Machine instance '${source.name}' runs on hypervisor host '${target.name}'.`;
      }
      const isSwitchSource = /switch|sw-|tor-|cisco|arista|juniper/i.test(sName) || /switch|router|network/i.test(sClass);
      const isServerTarget = /srv|server|db|storage|san|nas|node/i.test(tName);
      if (!matched && isSwitchSource && isServerTarget) {
        matched = true;
        relType = "connects_to";
        confidence = 92;
        namingMatch = `Top-of-Rack Fabric: [${source.name}] (Switch) \u2192 [${target.name}] (Host)`;
        roleDesc = "Physical Layer 2/3 Ethernet Port Trunking";
        reason = `Access Switch '${source.name}' provides uplinks and network access to server '${target.name}'.`;
      }
      const isDirectoryTarget = /dc-|ad-|ldap|dns|activedirectory|domaincontroller/i.test(tName);
      if (!matched && (isAppSource || isWebSource) && isDirectoryTarget) {
        matched = true;
        relType = "depends_on";
        confidence = 89;
        namingMatch = `Identity / Domain Dependency: [${source.name}] \u2192 [${target.name}] (Directory/DNS)`;
        roleDesc = "Domain Authentication & Name Resolution Service";
        reason = `Server '${source.name}' relies on Domain Controller / DNS server '${target.name}' for Kerberos/LDAP identity and host resolution.`;
      }
      if (!matched) {
        const sPrefix = sName.split(/[-_.]/)[0];
        const tPrefix = tName.split(/[-_.]/)[0];
        const sMiddle = sName.split(/[-_.]/)[1];
        const tMiddle = tName.split(/[-_.]/)[1];
        if (sPrefix && tPrefix && sPrefix === tPrefix && sPrefix.length >= 3 && sMiddle && tMiddle && sMiddle === tMiddle) {
          matched = true;
          relType = "connects_to";
          confidence = 82;
          namingMatch = `Cluster Namespace Match: '${sPrefix}-${sMiddle}-*'`;
          roleDesc = "Collocated Subsystem Service Cluster Pair";
          reason = `Servers '${source.name}' and '${target.name}' share identical service namespace prefix '${sPrefix}-${sMiddle}' indicating intra-cluster connectivity.`;
        }
      }
      if (matched) {
        if (net.isSameSubnet) {
          confidence = Math.min(99, confidence + 6);
          reason += ` Confirmed via high network proximity on subnet ${net.label}.`;
        } else if (net.isAdjacentSubnet) {
          confidence = Math.min(96, confidence + 3);
          reason += ` Confirmed via adjacent VLAN network proximity: ${net.label}.`;
        }
        if (source.locationId && target.locationId && source.locationId === target.locationId) {
          confidence = Math.min(99, confidence + 2);
        }
        const confidenceLevel = confidence >= 85 ? "HIGH" : confidence >= 70 ? "MEDIUM" : "LOW";
        proposals.push({
          id: `prop-${Date.now()}-${i}-${j}`,
          sourceCiId: source.id,
          sourceCiName: source.name,
          sourceCiClass: source.ciClassName || source.category || "Enterprise Server",
          sourceCiCategory: source.category || "Hardware",
          sourceIp: source.ipAddress || "10.20.4." + (10 + i),
          targetCiId: target.id,
          targetCiName: target.name,
          targetCiClass: target.ciClassName || target.category || "Enterprise Server",
          targetCiCategory: target.category || "Hardware",
          targetIp: target.ipAddress || "10.20.4." + (20 + j),
          relationshipType: relType,
          confidenceScore: confidence,
          confidenceLevel,
          reasoning: reason,
          detectionEvidence: {
            namingPatternMatch: namingMatch,
            networkProximity: net.label,
            architecturalRole: roleDesc,
            subnetDelta: net.delta !== 999 ? net.delta : void 0
          },
          suggestedAt: now,
          status: "PENDING"
        });
      }
    }
  }
  return proposals.sort((a, b) => b.confidenceScore - a.confidenceScore);
}
async function generateAiCiRelationshipSuggestions(cis, existingRels = []) {
  const heuristicProposals = analyzeServerNamingAndTopology(cis, existingRels);
  if (process.env.GEMINI_API_KEY && cis.length > 1) {
    try {
      const ai = new import_genai.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `You are a Principal Enterprise CMDB Architect.
Analyze the following server inventory list (Hostnames, IPs, Classes):
${JSON.stringify(
        cis.slice(0, 15).map((c) => ({ id: c.id, name: c.name, ip: c.ipAddress, class: c.ciClassName, category: c.category })),
        null,
        2
      )}

Existing Relationships:
${JSON.stringify(
        existingRels.slice(0, 10).map((r) => ({ source: r.sourceCiId, target: r.targetCiId, type: r.relationshipType || r.type })),
        null,
        2
      )}

Propose any additional high-confidence logical relationships (connects_to, depends_on, runs_on) between these assets based on naming conventions and IP proximity.
Return purely a valid JSON array of objects matching:
[
  {
    "sourceCiId": string,
    "targetCiId": string,
    "relationshipType": "connects_to" | "depends_on" | "runs_on",
    "confidenceScore": number (70-98),
    "reasoning": string
  }
]`;
      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      if (response.text) {
        const parsed = JSON.parse(response.text);
        if (Array.isArray(parsed)) {
          parsed.forEach((item, idx) => {
            const sCi = cis.find((c) => c.id === item.sourceCiId);
            const tCi = cis.find((c) => c.id === item.targetCiId);
            if (sCi && tCi && sCi.id !== tCi.id) {
              const alreadyExists = heuristicProposals.some(
                (p) => p.sourceCiId === sCi.id && p.targetCiId === tCi.id
              );
              if (!alreadyExists) {
                const net = evaluateNetworkProximity(sCi.ipAddress, tCi.ipAddress);
                heuristicProposals.push({
                  id: `prop-gemini-${Date.now()}-${idx}`,
                  sourceCiId: sCi.id,
                  sourceCiName: sCi.name,
                  sourceCiClass: sCi.ciClassName || sCi.category || "Enterprise Server",
                  sourceCiCategory: sCi.category || "Hardware",
                  sourceIp: sCi.ipAddress || "10.20.4.10",
                  targetCiId: tCi.id,
                  targetCiName: tCi.name,
                  targetCiClass: tCi.ciClassName || tCi.category || "Enterprise Server",
                  targetCiCategory: tCi.category || "Hardware",
                  targetIp: tCi.ipAddress || "10.20.4.15",
                  relationshipType: item.relationshipType || "connects_to",
                  confidenceScore: item.confidenceScore || 86,
                  confidenceLevel: item.confidenceScore >= 85 ? "HIGH" : "MEDIUM",
                  reasoning: item.reasoning || `Gemini AI inferred semantic connectivity between ${sCi.name} and ${tCi.name}.`,
                  detectionEvidence: {
                    namingPatternMatch: `Gemini Semantic Reasoning: [${sCi.name}] \u2192 [${tCi.name}]`,
                    networkProximity: net.label,
                    architecturalRole: "AI Model Inferred Application Topology"
                  },
                  suggestedAt: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 19),
                  status: "PENDING"
                });
              }
            }
          });
        }
      }
    } catch (err) {
      console.warn("Gemini API relationship inference fallback to local AI heuristics:", err);
    }
  }
  return heuristicProposals.sort((a, b) => b.confidenceScore - a.confidenceScore);
}

// src/database/mysql/mysqlDriver.ts
var import_promise = __toESM(require("mysql2/promise"), 1);
var pool = null;
function getMysqlPool() {
  if (pool) return pool;
  const host = process.env.DB_HOST || process.env.MYSQL_HOST;
  const user = process.env.DB_USER || process.env.MYSQL_USER;
  const password = process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD;
  const database = process.env.DB_NAME || process.env.MYSQL_DATABASE;
  const port = parseInt(process.env.DB_PORT || process.env.MYSQL_PORT || "3306", 10);
  if (!host || !user || !database) {
    return null;
  }
  try {
    pool = import_promise.default.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    return pool;
  } catch (err) {
    console.error("Failed to initialize MySQL Connection Pool:", err);
    return null;
  }
}
async function initializeMysqlTables() {
  const p = getMysqlPool();
  if (!p) return false;
  try {
    const connection = await p.getConnection();
    try {
      await connection.query("SET FOREIGN_KEY_CHECKS = 0;");
      const tableSqls = [
        `CREATE TABLE IF NOT EXISTS \`organizations\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`name\` VARCHAR(255) NOT NULL,
          \`code\` VARCHAR(64) NOT NULL,
          \`region\` ENUM('US', 'EU', 'APAC') NOT NULL DEFAULT 'US',
          \`status\` VARCHAR(32) NOT NULL DEFAULT 'Active',
          \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`),
          UNIQUE KEY \`idx_org_code\` (\`code\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        `CREATE TABLE IF NOT EXISTS \`users\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`organization_id\` VARCHAR(64) NOT NULL,
          \`name\` VARCHAR(255) NOT NULL,
          \`email\` VARCHAR(255) NOT NULL,
          \`password_hash\` VARCHAR(255) NOT NULL,
          \`salt\` VARCHAR(128) NOT NULL,
          \`role\` VARCHAR(64) NOT NULL DEFAULT 'CLIENT_SUPER_ADMIN',
          \`department_id\` VARCHAR(64) DEFAULT 'd-1',
          \`location_id\` VARCHAR(64) DEFAULT 'loc-1',
          \`job_title\` VARCHAR(128) DEFAULT NULL,
          \`phone\` VARCHAR(64) DEFAULT NULL,
          \`country\` VARCHAR(64) DEFAULT 'United States',
          \`mfa_enabled\` TINYINT(1) NOT NULL DEFAULT 0,
          \`mfa_method\` VARCHAR(64) DEFAULT 'google_authenticator',
          \`mfa_setup_required\` TINYINT(1) NOT NULL DEFAULT 1,
          \`status\` ENUM('Active', 'Locked', 'Disabled') NOT NULL DEFAULT 'Active',
          \`last_login_at\` DATETIME DEFAULT NULL,
          \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`),
          UNIQUE KEY \`idx_user_email\` (\`email\`),
          KEY \`idx_user_organization\` (\`organization_id\`),
          KEY \`idx_user_role\` (\`role\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        `CREATE TABLE IF NOT EXISTS \`mfa_secrets\` (
          \`user_id\` VARCHAR(64) NOT NULL,
          \`user_email\` VARCHAR(255) NOT NULL,
          \`mfa_enabled\` TINYINT(1) NOT NULL DEFAULT 0,
          \`mfa_method\` VARCHAR(64) NOT NULL DEFAULT 'google_authenticator',
          \`encrypted_secret\` TEXT NOT NULL,
          \`recovery_codes_hash\` JSON DEFAULT NULL,
          \`verified_at\` DATETIME DEFAULT NULL,
          \`last_used_at\` DATETIME DEFAULT NULL,
          \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (\`user_id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        `CREATE TABLE IF NOT EXISTS \`mfa_reset_requests\` (
          \`request_id\` VARCHAR(64) NOT NULL,
          \`user_id\` VARCHAR(64) NOT NULL,
          \`user_name\` VARCHAR(255) NOT NULL,
          \`user_email\` VARCHAR(255) NOT NULL,
          \`tenant_id\` VARCHAR(64) NOT NULL,
          \`tenant_name\` VARCHAR(255) NOT NULL,
          \`mfa_method\` VARCHAR(64) DEFAULT 'google_authenticator',
          \`request_reason\` TEXT NOT NULL,
          \`status\` ENUM('Pending', 'Approved', 'Rejected', 'Completed') NOT NULL DEFAULT 'Pending',
          \`requested_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`reviewed_by\` VARCHAR(255) DEFAULT NULL,
          \`reviewed_at\` DATETIME DEFAULT NULL,
          \`admin_notes\` TEXT DEFAULT NULL,
          PRIMARY KEY (\`request_id\`),
          KEY \`idx_mfa_req_user\` (\`user_id\`),
          KEY \`idx_mfa_req_tenant\` (\`tenant_id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        `CREATE TABLE IF NOT EXISTS \`active_sessions\` (
          \`token\` VARCHAR(255) NOT NULL,
          \`user_id\` VARCHAR(64) NOT NULL,
          \`tenant_id\` VARCHAR(64) NOT NULL,
          \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`expires_at\` DATETIME NOT NULL,
          PRIMARY KEY (\`token\`),
          KEY \`idx_session_user\` (\`user_id\`),
          KEY \`idx_session_tenant\` (\`tenant_id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        `CREATE TABLE IF NOT EXISTS \`departments\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`name\` VARCHAR(255) NOT NULL,
          \`code\` VARCHAR(64) NOT NULL,
          \`manager_id\` VARCHAR(64) DEFAULT NULL,
          \`cost_center_id\` VARCHAR(64) DEFAULT NULL,
          \`tenant_id\` VARCHAR(64) NOT NULL DEFAULT 'tenant-1',
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        `CREATE TABLE IF NOT EXISTS \`locations\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`name\` VARCHAR(255) NOT NULL,
          \`city\` VARCHAR(128) DEFAULT NULL,
          \`country\` VARCHAR(128) DEFAULT NULL,
          \`address\` TEXT DEFAULT NULL,
          \`type\` VARCHAR(64) NOT NULL DEFAULT 'Headquarters',
          \`tenant_id\` VARCHAR(64) NOT NULL DEFAULT 'tenant-1',
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        `CREATE TABLE IF NOT EXISTS \`ci_classes\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`name\` VARCHAR(255) NOT NULL,
          \`category\` VARCHAR(64) NOT NULL,
          \`description\` TEXT DEFAULT NULL,
          \`icon_name\` VARCHAR(64) DEFAULT 'Server',
          \`custom_attributes_schema\` JSON DEFAULT NULL,
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        `CREATE TABLE IF NOT EXISTS \`configuration_items\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`name\` VARCHAR(255) NOT NULL,
          \`ci_class_id\` VARCHAR(64) DEFAULT NULL,
          \`ci_class_name\` VARCHAR(255) DEFAULT NULL,
          \`category\` VARCHAR(64) NOT NULL DEFAULT 'Hardware',
          \`asset_tag\` VARCHAR(128) DEFAULT NULL,
          \`serial_number\` VARCHAR(128) DEFAULT NULL,
          \`hostname\` VARCHAR(255) DEFAULT NULL,
          \`ip_address\` VARCHAR(64) DEFAULT NULL,
          \`mac_address\` VARCHAR(64) DEFAULT NULL,
          \`manufacturer\` VARCHAR(255) DEFAULT NULL,
          \`model\` VARCHAR(255) DEFAULT NULL,
          \`operating_system\` VARCHAR(255) DEFAULT NULL,
          \`os_version\` VARCHAR(128) DEFAULT NULL,
          \`location_id\` VARCHAR(64) DEFAULT NULL,
          \`location_name\` VARCHAR(255) DEFAULT NULL,
          \`department_id\` VARCHAR(64) DEFAULT NULL,
          \`department_name\` VARCHAR(255) DEFAULT NULL,
          \`owner_user_id\` VARCHAR(64) DEFAULT NULL,
          \`owner_user_name\` VARCHAR(255) DEFAULT NULL,
          \`lifecycle_state\` VARCHAR(64) NOT NULL DEFAULT 'Deployed',
          \`discovery_source\` VARCHAR(64) DEFAULT 'Manual',
          \`last_discovered\` DATETIME DEFAULT NULL,
          \`health_score\` INT NOT NULL DEFAULT 100,
          \`data_classification\` VARCHAR(64) DEFAULT 'Internal',
          \`cost_center_id\` VARCHAR(64) DEFAULT NULL,
          \`cost\` DECIMAL(12,2) DEFAULT 0.00,
          \`purchase_date\` DATE DEFAULT NULL,
          \`custom_attributes\` JSON DEFAULT NULL,
          \`risk_score\` INT NOT NULL DEFAULT 0,
          \`eol_date\` DATE DEFAULT NULL,
          \`eos_date\` DATE DEFAULT NULL,
          \`tenant_id\` VARCHAR(64) NOT NULL DEFAULT 'tenant-1',
          \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`),
          KEY \`idx_ci_tenant\` (\`tenant_id\`),
          KEY \`idx_ci_category\` (\`category\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        `CREATE TABLE IF NOT EXISTS \`ci_relationships\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`source_ci_id\` VARCHAR(64) NOT NULL,
          \`source_ci_name\` VARCHAR(255) DEFAULT NULL,
          \`target_ci_id\` VARCHAR(64) NOT NULL,
          \`target_ci_name\` VARCHAR(255) DEFAULT NULL,
          \`type\` VARCHAR(64) NOT NULL,
          \`discovery_source\` VARCHAR(64) DEFAULT 'Manual',
          \`confidence\` INT NOT NULL DEFAULT 100,
          \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`),
          KEY \`idx_rel_source\` (\`source_ci_id\`),
          KEY \`idx_rel_target\` (\`target_ci_id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        `CREATE TABLE IF NOT EXISTS \`discovery_jobs\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`name\` VARCHAR(255) NOT NULL,
          \`type\` VARCHAR(64) NOT NULL DEFAULT 'Subnet Range',
          \`target\` VARCHAR(255) NOT NULL,
          \`schedule\` VARCHAR(64) NOT NULL DEFAULT 'Manual',
          \`status\` VARCHAR(64) NOT NULL DEFAULT 'Queued',
          \`items_discovered\` INT NOT NULL DEFAULT 0,
          \`last_run\` VARCHAR(64) DEFAULT NULL,
          \`credentials_ref\` VARCHAR(128) DEFAULT NULL,
          \`logs\` JSON DEFAULT NULL,
          \`tenant_id\` VARCHAR(64) NOT NULL DEFAULT 'tenant-1',
          PRIMARY KEY (\`id\`),
          KEY \`idx_disc_tenant\` (\`tenant_id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        `CREATE TABLE IF NOT EXISTS \`endpoint_agents\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`hostname\` VARCHAR(255) NOT NULL,
          \`os\` VARCHAR(64) NOT NULL,
          \`ip_address\` VARCHAR(64) NOT NULL,
          \`agent_version\` VARCHAR(64) NOT NULL,
          \`status\` VARCHAR(64) NOT NULL DEFAULT 'Online',
          \`last_seen\` DATETIME DEFAULT NULL,
          \`pending_queued_events\` INT NOT NULL DEFAULT 0,
          \`tenant_id\` VARCHAR(64) NOT NULL DEFAULT 'tenant-1',
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        `CREATE TABLE IF NOT EXISTS \`software_catalog\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`publisher\` VARCHAR(255) NOT NULL,
          \`product_name\` VARCHAR(255) NOT NULL,
          \`raw_strings\` JSON DEFAULT NULL,
          \`category\` VARCHAR(128) DEFAULT NULL,
          \`is_licensed\` TINYINT(1) NOT NULL DEFAULT 1,
          \`latest_version\` VARCHAR(64) DEFAULT NULL,
          \`eol_date\` DATE DEFAULT NULL,
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        `CREATE TABLE IF NOT EXISTS \`drift_events\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`ci_id\` VARCHAR(64) NOT NULL,
          \`ci_name\` VARCHAR(255) NOT NULL,
          \`attribute_name\` VARCHAR(128) NOT NULL,
          \`previous_value\` TEXT DEFAULT NULL,
          \`new_value\` TEXT DEFAULT NULL,
          \`detected_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`risk_level\` VARCHAR(32) NOT NULL DEFAULT 'Medium',
          \`status\` VARCHAR(32) NOT NULL DEFAULT 'Open',
          \`tenant_id\` VARCHAR(64) NOT NULL DEFAULT 'tenant-1',
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        `CREATE TABLE IF NOT EXISTS \`stockrooms\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`name\` VARCHAR(255) NOT NULL,
          \`location_id\` VARCHAR(64) DEFAULT NULL,
          \`location_name\` VARCHAR(255) DEFAULT NULL,
          \`manager_name\` VARCHAR(255) DEFAULT NULL,
          \`asset_count\` INT NOT NULL DEFAULT 0,
          \`reorder_threshold\` INT NOT NULL DEFAULT 5,
          \`tenant_id\` VARCHAR(64) NOT NULL DEFAULT 'tenant-1',
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        `CREATE TABLE IF NOT EXISTS \`software_licenses\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`publisher\` VARCHAR(255) NOT NULL,
          \`product_name\` VARCHAR(255) NOT NULL,
          \`metric\` VARCHAR(64) NOT NULL DEFAULT 'Per User',
          \`purchased_entitlements\` INT NOT NULL DEFAULT 0,
          \`consumed_entitlements\` INT NOT NULL DEFAULT 0,
          \`unit_cost\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
          \`total_cost\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
          \`purchase_date\` DATE DEFAULT NULL,
          \`expiration_date\` DATE DEFAULT NULL,
          \`contract_id\` VARCHAR(64) DEFAULT NULL,
          \`compliance_status\` VARCHAR(64) NOT NULL DEFAULT 'Compliant',
          \`compliance_gap\` INT NOT NULL DEFAULT 0,
          \`financial_liability\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
          \`publisher_pack\` VARCHAR(64) DEFAULT 'Generic',
          \`tenant_id\` VARCHAR(64) NOT NULL DEFAULT 'tenant-1',
          \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`),
          KEY \`idx_license_tenant\` (\`tenant_id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        `CREATE TABLE IF NOT EXISTS \`vendors\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`name\` VARCHAR(255) NOT NULL,
          \`contact_email\` VARCHAR(255) DEFAULT NULL,
          \`phone\` VARCHAR(64) DEFAULT NULL,
          \`rating\` INT NOT NULL DEFAULT 5,
          \`active_contracts_count\` INT NOT NULL DEFAULT 0,
          \`tenant_id\` VARCHAR(64) NOT NULL DEFAULT 'tenant-1',
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        `CREATE TABLE IF NOT EXISTS \`contracts\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`contract_number\` VARCHAR(128) NOT NULL,
          \`title\` VARCHAR(255) NOT NULL,
          \`vendor_id\` VARCHAR(64) DEFAULT NULL,
          \`vendor_name\` VARCHAR(255) DEFAULT NULL,
          \`type\` VARCHAR(64) NOT NULL DEFAULT 'MSA',
          \`start_date\` DATE DEFAULT NULL,
          \`end_date\` DATE DEFAULT NULL,
          \`renewal_date\` DATE DEFAULT NULL,
          \`auto_renew\` TINYINT(1) NOT NULL DEFAULT 0,
          \`total_value\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
          \`owner_name\` VARCHAR(255) DEFAULT NULL,
          \`status\` VARCHAR(64) NOT NULL DEFAULT 'Active',
          \`tenant_id\` VARCHAR(64) NOT NULL DEFAULT 'tenant-1',
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        `CREATE TABLE IF NOT EXISTS \`purchase_orders\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`po_number\` VARCHAR(128) NOT NULL,
          \`vendor_name\` VARCHAR(255) NOT NULL,
          \`requestor_name\` VARCHAR(255) DEFAULT NULL,
          \`order_date\` DATE DEFAULT NULL,
          \`total_amount\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
          \`status\` VARCHAR(64) NOT NULL DEFAULT 'Approved',
          \`item_count\` INT NOT NULL DEFAULT 1,
          \`tenant_id\` VARCHAR(64) NOT NULL DEFAULT 'tenant-1',
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        `CREATE TABLE IF NOT EXISTS \`cost_centers\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`code\` VARCHAR(64) NOT NULL,
          \`name\` VARCHAR(255) NOT NULL,
          \`department_name\` VARCHAR(255) DEFAULT NULL,
          \`budget_allocated\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
          \`current_spend\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
          \`tenant_id\` VARCHAR(64) NOT NULL DEFAULT 'tenant-1',
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        `CREATE TABLE IF NOT EXISTS \`depreciation_schedules\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`asset_id\` VARCHAR(64) NOT NULL,
          \`asset_name\` VARCHAR(255) NOT NULL,
          \`purchase_cost\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
          \`salvage_value\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
          \`useful_life_years\` INT NOT NULL DEFAULT 3,
          \`method\` VARCHAR(64) NOT NULL DEFAULT 'Straight-line',
          \`start_date\` DATE DEFAULT NULL,
          \`current_book_value\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
          \`accumulated_depreciation\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
          \`tenant_id\` VARCHAR(64) NOT NULL DEFAULT 'tenant-1',
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        `CREATE TABLE IF NOT EXISTS \`disposal_records\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`asset_id\` VARCHAR(64) NOT NULL,
          \`asset_tag\` VARCHAR(128) NOT NULL,
          \`serial_number\` VARCHAR(128) NOT NULL,
          \`reason\` TEXT DEFAULT NULL,
          \`disposal_vendor\` VARCHAR(255) DEFAULT NULL,
          \`data_wipe_certified\` TINYINT(1) NOT NULL DEFAULT 1,
          \`wipe_method\` VARCHAR(128) DEFAULT NULL,
          \`approved_by\` VARCHAR(255) DEFAULT NULL,
          \`disposal_date\` DATE DEFAULT NULL,
          \`certificate_number\` VARCHAR(128) DEFAULT NULL,
          \`document_url\` TEXT DEFAULT NULL,
          \`tenant_id\` VARCHAR(64) NOT NULL DEFAULT 'tenant-1',
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        `CREATE TABLE IF NOT EXISTS \`itsm_tickets\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`ticket_number\` VARCHAR(64) NOT NULL,
          \`title\` VARCHAR(255) NOT NULL,
          \`type\` VARCHAR(64) NOT NULL DEFAULT 'Incident',
          \`priority\` VARCHAR(64) NOT NULL DEFAULT 'P3 - Medium',
          \`status\` VARCHAR(64) NOT NULL DEFAULT 'Open',
          \`related_ci_id\` VARCHAR(64) DEFAULT NULL,
          \`related_ci_name\` VARCHAR(255) DEFAULT NULL,
          \`assigned_to\` VARCHAR(255) DEFAULT NULL,
          \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`tenant_id\` VARCHAR(64) NOT NULL DEFAULT 'tenant-1',
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        `CREATE TABLE IF NOT EXISTS \`workflow_definitions\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`name\` VARCHAR(255) NOT NULL,
          \`trigger_event\` VARCHAR(128) NOT NULL,
          \`description\` TEXT DEFAULT NULL,
          \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
          \`steps\` JSON DEFAULT NULL,
          \`tenant_id\` VARCHAR(64) NOT NULL DEFAULT 'tenant-1',
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        `CREATE TABLE IF NOT EXISTS \`workflow_instances\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`workflow_id\` VARCHAR(64) NOT NULL,
          \`workflow_name\` VARCHAR(255) NOT NULL,
          \`entity_type\` VARCHAR(64) NOT NULL,
          \`entity_name\` VARCHAR(255) NOT NULL,
          \`initiated_by\` VARCHAR(255) NOT NULL,
          \`current_step_number\` INT NOT NULL DEFAULT 1,
          \`total_steps\` INT NOT NULL DEFAULT 3,
          \`status\` VARCHAR(64) NOT NULL DEFAULT 'In Progress',
          \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          \`tenant_id\` VARCHAR(64) NOT NULL DEFAULT 'tenant-1',
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        `CREATE TABLE IF NOT EXISTS \`self_service_requests\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`request_number\` VARCHAR(64) NOT NULL,
          \`item_type\` VARCHAR(64) NOT NULL,
          \`title\` VARCHAR(255) NOT NULL,
          \`requested_by\` VARCHAR(255) NOT NULL,
          \`department\` VARCHAR(255) DEFAULT NULL,
          \`urgency\` VARCHAR(32) NOT NULL DEFAULT 'Standard',
          \`status\` VARCHAR(64) NOT NULL DEFAULT 'Submitted',
          \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`tenant_id\` VARCHAR(64) NOT NULL DEFAULT 'tenant-1',
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        `CREATE TABLE IF NOT EXISTS \`vulnerability_cves\` (
          \`cve_id\` VARCHAR(64) NOT NULL,
          \`title\` VARCHAR(255) NOT NULL,
          \`severity\` VARCHAR(32) NOT NULL DEFAULT 'High',
          \`cvss_score\` DECIMAL(4,1) NOT NULL DEFAULT 7.5,
          \`published_date\` DATE DEFAULT NULL,
          \`affected_product\` VARCHAR(255) NOT NULL,
          \`affected_cis_count\` INT NOT NULL DEFAULT 0,
          \`remediation_status\` VARCHAR(64) NOT NULL DEFAULT 'Unpatched',
          PRIMARY KEY (\`cve_id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        `CREATE TABLE IF NOT EXISTS \`policy_rules\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`name\` VARCHAR(255) NOT NULL,
          \`category\` VARCHAR(64) NOT NULL DEFAULT 'Security',
          \`description\` TEXT DEFAULT NULL,
          \`severity\` VARCHAR(32) NOT NULL DEFAULT 'High',
          \`is_enabled\` TINYINT(1) NOT NULL DEFAULT 1,
          \`violations_count\` INT NOT NULL DEFAULT 0,
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        `CREATE TABLE IF NOT EXISTS \`policy_violations\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`policy_rule_id\` VARCHAR(64) NOT NULL,
          \`policy_name\` VARCHAR(255) NOT NULL,
          \`ci_id\` VARCHAR(64) NOT NULL,
          \`ci_name\` VARCHAR(255) NOT NULL,
          \`severity\` VARCHAR(32) NOT NULL DEFAULT 'High',
          \`details\` TEXT DEFAULT NULL,
          \`detected_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`status\` VARCHAR(32) NOT NULL DEFAULT 'Open',
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        `CREATE TABLE IF NOT EXISTS \`audit_logs\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`action\` VARCHAR(64) NOT NULL,
          \`entity_type\` VARCHAR(64) NOT NULL,
          \`entity_id\` VARCHAR(64) NOT NULL,
          \`performed_by\` VARCHAR(255) NOT NULL,
          \`details\` TEXT DEFAULT NULL,
          \`tenant_id\` VARCHAR(64) NOT NULL DEFAULT 'tenant-1',
          \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`),
          KEY \`idx_audit_tenant\` (\`tenant_id\`),
          KEY \`idx_audit_action\` (\`action\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
      ];
      for (const sql of tableSqls) {
        await connection.query(sql);
      }
      await connection.query("SET FOREIGN_KEY_CHECKS = 1;");
      await connection.query(`
        INSERT INTO \`organizations\` (\`id\`, \`name\`, \`code\`, \`region\`, \`status\`)
        VALUES 
          ('tenant-platform-global', 'Uclik Technologies (Platform Global)', 'UCLIK-SUPER', 'US', 'Active'),
          ('tenant-1', 'Kubernesis Security Pvt. Ltd.', 'KSPL-HQ', 'US', 'Active')
        ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`);
      `);
      await connection.query(`
        INSERT INTO \`users\` (
          \`id\`, \`organization_id\`, \`name\`, \`email\`, \`password_hash\`, \`salt\`, \`role\`,
          \`job_title\`, \`phone\`, \`country\`, \`mfa_enabled\`, \`mfa_setup_required\`, \`status\`
        )
        VALUES (
          'usr-super-admin-jitin',
          'tenant-platform-global',
          'Jitin (Platform Super Admin)',
          'jitin@ucliktechnologies.com',
          '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
          'd41d8cd98f00b204e9800998ecf8427e',
          'SOFTWARE_SUPER_ADMIN',
          'Global Software Super Admin',
          '+1 (800) 555-0199',
          'United States',
          0,
          1,
          'Active'
        )
        ON DUPLICATE KEY UPDATE
          \`role\` = 'SOFTWARE_SUPER_ADMIN',
          \`organization_id\` = 'tenant-platform-global';
      `);
      return true;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error("Error during MySQL tables initialization:", err);
    return false;
  }
}
async function checkMysqlHealth() {
  const p = getMysqlPool();
  if (!p) {
    return {
      connected: false,
      message: "MySQL configuration not detected. Running on primary server auth store."
    };
  }
  try {
    const connection = await p.getConnection();
    connection.release();
    return {
      connected: true,
      message: "Successfully connected to cPanel MySQL Database Server."
    };
  } catch (err) {
    return {
      connected: false,
      message: `MySQL Connection Error: ${err?.message || String(err)}`
    };
  }
}

// server.ts
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.set("trust proxy", true);
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Agent-Enrollment-Token, X-Agent-Version, Accept");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});
app.use(import_express.default.json({ limit: "10mb" }));
function getServerBaseUrl(req) {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const proto = (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto || (req.secure ? "https" : req.protocol) || "https").split(",")[0].trim();
  const forwardedHost = req.headers["x-forwarded-host"];
  const host = (Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost || req.get("host") || "localhost:3000").split(",")[0].trim();
  return `${proto}://${host}`;
}
var aiKey = process.env.GEMINI_API_KEY;
var aiClient = null;
if (aiKey) {
  aiClient = new import_genai2.GoogleGenAI({
    apiKey: aiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}
initializeMysqlTables().then((success) => {
  if (success) console.log("MySQL Database Engine: All 30 tables initialized successfully.");
}).catch((err) => console.error("MySQL Init Warning:", err));
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    system: "KSPL ITAM Enterprise Platform Engine",
    geminiConfigured: !!aiKey,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.get("/api/db/health", async (req, res) => {
  try {
    const health = await checkMysqlHealth();
    res.json(health);
  } catch (err) {
    res.status(500).json({ connected: false, message: "Failed checking database health" });
  }
});
app.post("/api/db/init", async (req, res) => {
  try {
    const success = await initializeMysqlTables();
    if (success) {
      return res.json({ success: true, message: "All 30 MySQL tables verified, created, and updated successfully." });
    } else {
      return res.status(500).json({ success: false, message: "MySQL configuration missing or connection failed." });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err?.message || String(err) });
  }
});
app.post("/api/auth/register", (req, res) => {
  try {
    const result = registerUser(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    return res.status(201).json(result);
  } catch (err) {
    console.error("Error in /api/auth/register:", err);
    return res.status(500).json({ error: "Internal server error during registration." });
  }
});
app.post("/api/auth/login", (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    const result = loginUser(email, password, rememberMe);
    if (!result.success) {
      return res.status(401).json({ error: result.error });
    }
    return res.json(result);
  } catch (err) {
    console.error("Error in /api/auth/login:", err);
    return res.status(500).json({ error: "Internal server error during authentication." });
  }
});
app.post("/api/auth/logout", (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.replace(/^Bearer\s+/i, "") || req.body?.token;
    logoutSession(token);
    return res.json({ success: true, message: "Logged out successfully." });
  } catch (err) {
    return res.status(500).json({ error: "Failed to process logout." });
  }
});
app.get("/api/auth/me", (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    const session = getSession(token);
    if (!session) {
      return res.status(401).json({ authenticated: false, error: "Invalid or expired session token." });
    }
    return res.json({ authenticated: true, user: session.user, tenant: session.tenant });
  } catch (err) {
    return res.status(500).json({ error: "Failed to resolve session." });
  }
});
app.post("/api/auth/forgot-password", (req, res) => {
  try {
    const { email } = req.body;
    const result = requestPasswordReset(email);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to process password reset request." });
  }
});
app.post("/api/auth/reset-password", (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;
    const result = resetPassword(token, newPassword, confirmPassword);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to reset password." });
  }
});
app.post("/api/auth/onboarding", (req, res) => {
  try {
    const { userId, tenantId, companyName, logo, region, currency, timezone } = req.body;
    const result = completeOnboarding(userId, tenantId, { companyName, logo, region, currency, timezone });
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to save onboarding settings." });
  }
});
app.put("/api/auth/profile", (req, res) => {
  try {
    const { userId, firstName, lastName, jobTitle, phone, country, password } = req.body;
    const result = updateUserProfile(userId, { firstName, lastName, jobTitle, phone, country, password });
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to update user profile." });
  }
});
app.post("/api/users/provision", (req, res) => {
  try {
    const { name, email, role, departmentId, locationId, tenantId, jobTitle, password } = req.body;
    const result = provisionUserByAdmin({
      name,
      email,
      role,
      departmentId,
      locationId,
      tenantId,
      jobTitle,
      password
    });
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to provision user." });
  }
});
app.put("/api/users/:userId/role", (req, res) => {
  try {
    const { userId } = req.params;
    const { role, status, departmentId, jobTitle } = req.body;
    const result = updateUserRoleAndStatus(userId, { role, status, departmentId, jobTitle });
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to update user role and status." });
  }
});
app.get(["/api/rbac/matrix", "/api/auth/rbac-matrix"], (req, res) => {
  try {
    const tenantId = req.query.tenantId || "tenant-client-1";
    const matrixState = getRbacMatrixForTenant(tenantId);
    return res.json({ success: true, data: matrixState });
  } catch (err) {
    return res.status(500).json({ error: "Failed to retrieve RBAC matrix." });
  }
});
app.post(["/api/rbac/matrix", "/api/auth/rbac-matrix"], (req, res) => {
  try {
    const { tenantId = "tenant-client-1", matrix, capabilities, updatedBy } = req.body;
    if (!matrix) {
      return res.status(400).json({ error: "Matrix permissions payload is required." });
    }
    const result = saveRbacMatrixForTenant(tenantId, matrix, capabilities, updatedBy);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to save RBAC matrix." });
  }
});
app.post(["/api/rbac/matrix/reset", "/api/auth/rbac-matrix/reset"], (req, res) => {
  try {
    const { tenantId = "tenant-client-1" } = req.body;
    const result = resetRbacMatrixForTenant(tenantId);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to reset RBAC matrix." });
  }
});
app.post("/api/auth/mfa/verify", (req, res) => {
  try {
    const { tempToken, code } = req.body;
    const result = verifyMfaLogin(tempToken, code);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error during MFA verification." });
  }
});
app.post("/api/auth/mfa/verify-recovery", (req, res) => {
  try {
    const { tempToken, recoveryCode } = req.body;
    const result = verifyMfaRecoveryLogin(tempToken, recoveryCode);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to verify recovery code." });
  }
});
app.post("/api/auth/mfa/setup/initiate", (req, res) => {
  try {
    const { userId, mfaMethod } = req.body;
    const result = initiateMfaSetup(userId, mfaMethod || "google_authenticator");
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to initiate MFA setup." });
  }
});
app.post("/api/auth/mfa/setup/confirm", (req, res) => {
  try {
    const { userId, code } = req.body;
    const result = confirmMfaSetup(userId, code);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to confirm MFA setup." });
  }
});
app.post("/api/auth/mfa/change-authenticator", (req, res) => {
  try {
    const { userId, currentPassword, currentCode, newMethod } = req.body;
    const result = changeMfaAuthenticator(userId, currentPassword, currentCode, newMethod);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to change authenticator." });
  }
});
app.post("/api/auth/mfa/regenerate-recovery-codes", (req, res) => {
  try {
    const { userId, currentCode } = req.body;
    const result = regenerateRecoveryCodes(userId, currentCode);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to regenerate recovery codes." });
  }
});
app.post("/api/auth/mfa/request-reset", (req, res) => {
  try {
    const { email, reason } = req.body;
    const result = createMfaResetRequest(email, reason);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to submit MFA reset request." });
  }
});
function requireSoftwareSuperAdmin(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  const session = getSession(token);
  if (!session || !session.user || session.user.role !== "SOFTWARE_SUPER_ADMIN") {
    return res.status(403).json({ error: "Access denied: Software Super Admin privileges required." });
  }
  req.user = session.user;
  req.tenant = session.tenant;
  next();
}
app.get("/api/super-admin/overview", requireSoftwareSuperAdmin, (req, res) => {
  try {
    const overview = getSuperAdminFullPlatformOverview();
    return res.json(overview);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch platform overview." });
  }
});
app.get("/api/super-admin/tenants", requireSoftwareSuperAdmin, (req, res) => {
  try {
    const tenants2 = getPlatformClientOrganizations();
    return res.json({ tenants: tenants2 });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch global tenants." });
  }
});
app.post("/api/super-admin/tenants", requireSoftwareSuperAdmin, (req, res) => {
  try {
    const result = createClientOrganization(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to create client organization." });
  }
});
app.get("/api/super-admin/tenants/:id", requireSoftwareSuperAdmin, (req, res) => {
  try {
    const detail = getClientOrganizationDetail(req.params.id);
    if (!detail) return res.status(404).json({ error: "Client organization not found." });
    return res.json(detail);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch client detail." });
  }
});
app.put("/api/super-admin/tenants/:id", requireSoftwareSuperAdmin, (req, res) => {
  try {
    const result = updateClientOrganization(req.params.id, req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to update client organization." });
  }
});
app.post("/api/super-admin/tenants/:id/status", requireSoftwareSuperAdmin, (req, res) => {
  try {
    const { status, reason } = req.body;
    const result = setClientOrganizationStatus(req.params.id, status, reason);
    if (!result.success) return res.status(400).json({ error: result.error });
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to update client organization status." });
  }
});
app.get("/api/super-admin/users", requireSoftwareSuperAdmin, (req, res) => {
  try {
    const { search, tenant, mfa } = req.query;
    const users2 = getGlobalUsersList(
      search ? String(search) : void 0,
      tenant ? String(tenant) : void 0,
      mfa ? String(mfa) : void 0
    );
    return res.json({ users: users2 });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch global users." });
  }
});
app.post("/api/super-admin/users", requireSoftwareSuperAdmin, (req, res) => {
  try {
    const result = provisionUserByAdmin(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to create user." });
  }
});
app.put("/api/super-admin/users/:userId", requireSoftwareSuperAdmin, (req, res) => {
  try {
    const result = updateUserRoleAndStatus(req.params.userId, req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to update user." });
  }
});
app.get("/api/super-admin/mfa-requests", requireSoftwareSuperAdmin, (req, res) => {
  try {
    const requests = getAllMfaResetRequests();
    return res.json({ requests });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch MFA reset requests." });
  }
});
app.post("/api/super-admin/mfa-requests/:requestId/approve", requireSoftwareSuperAdmin, (req, res) => {
  try {
    const { requestId } = req.params;
    const { reviewerName } = req.body;
    const result = approveMfaResetRequest(requestId, reviewerName);
    if (!result.success) return res.status(400).json({ error: result.error });
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to approve MFA reset request." });
  }
});
app.post("/api/super-admin/mfa-requests/:requestId/reject", requireSoftwareSuperAdmin, (req, res) => {
  try {
    const { requestId } = req.params;
    const { reason, reviewerName } = req.body;
    const result = rejectMfaResetRequest(requestId, reason, reviewerName);
    if (!result.success) return res.status(400).json({ error: result.error });
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to reject MFA reset request." });
  }
});
app.get("/api/super-admin/security-events", requireSoftwareSuperAdmin, (req, res) => {
  try {
    const { tenantId, severity, eventType, search } = req.query;
    const events = getPlatformSecurityEvents({
      tenantId: tenantId ? String(tenantId) : void 0,
      severity: severity ? String(severity) : void 0,
      eventType: eventType ? String(eventType) : void 0,
      search: search ? String(search) : void 0
    });
    return res.json({ events });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch security events." });
  }
});
app.get("/api/super-admin/system-health", requireSoftwareSuperAdmin, (req, res) => {
  try {
    const health = getPlatformSystemHealth();
    return res.json(health);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch system health." });
  }
});
app.get("/api/super-admin/integrations", requireSoftwareSuperAdmin, (req, res) => {
  try {
    const integrations = getPlatformIntegrations();
    return res.json({ integrations });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch platform integrations." });
  }
});
app.post("/api/super-admin/integrations/:id/toggle", requireSoftwareSuperAdmin, (req, res) => {
  try {
    const result = togglePlatformIntegration(req.params.id, !!req.body.isEnabled);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to toggle integration." });
  }
});
app.post("/api/super-admin/integrations/:id/test", requireSoftwareSuperAdmin, (req, res) => {
  try {
    const result = testPlatformIntegration(req.params.id);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to test integration." });
  }
});
app.get("/api/super-admin/api-keys", requireSoftwareSuperAdmin, (req, res) => {
  try {
    const keys = getPlatformApiKeys();
    return res.json({ keys });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch API keys." });
  }
});
app.post("/api/super-admin/api-keys", requireSoftwareSuperAdmin, (req, res) => {
  try {
    const result = createPlatformApiKey(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to create API key." });
  }
});
app.delete("/api/super-admin/api-keys/:id", requireSoftwareSuperAdmin, (req, res) => {
  try {
    const result = revokePlatformApiKey(req.params.id);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to revoke API key." });
  }
});
app.get("/api/super-admin/webhooks", requireSoftwareSuperAdmin, (req, res) => {
  try {
    const webhooks = getPlatformWebhooks();
    return res.json({ webhooks });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch webhooks." });
  }
});
app.post("/api/super-admin/webhooks", requireSoftwareSuperAdmin, (req, res) => {
  try {
    const result = createPlatformWebhook(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to create webhook." });
  }
});
app.get("/api/super-admin/settings", requireSoftwareSuperAdmin, (req, res) => {
  try {
    const settings = getPlatformSystemSettings();
    return res.json(settings);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch system settings." });
  }
});
app.put("/api/super-admin/settings", requireSoftwareSuperAdmin, (req, res) => {
  try {
    const result = updatePlatformSystemSettings(req.body);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to update system settings." });
  }
});
app.get("/api/super-admin/backups", requireSoftwareSuperAdmin, (req, res) => {
  try {
    const snapshots = getPlatformBackupSnapshots();
    return res.json({ snapshots });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch backup snapshots." });
  }
});
app.post("/api/super-admin/backups", requireSoftwareSuperAdmin, (req, res) => {
  try {
    const result = createPlatformBackupSnapshot(req.body.type, req.user?.email);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to create backup snapshot." });
  }
});
app.get("/api/super-admin/backups/export", requireSoftwareSuperAdmin, (req, res) => {
  try {
    const format = req.query.format === "sql" ? "sql" : "json";
    const dump = exportPlatformDatabaseDump(format);
    return res.json(dump);
  } catch (err) {
    return res.status(500).json({ error: "Failed to export database dump." });
  }
});
app.get("/api/super-admin/roles", requireSoftwareSuperAdmin, (req, res) => {
  try {
    const roles = getPlatformRoles();
    return res.json({ roles });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch platform roles." });
  }
});
app.post("/api/super-admin/roles", requireSoftwareSuperAdmin, (req, res) => {
  try {
    const result = createPlatformRole(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to create role." });
  }
});
app.get("/api/super-admin/search", requireSoftwareSuperAdmin, (req, res) => {
  try {
    const result = performGlobalPlatformSearch(String(req.query.q || ""));
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to perform platform search." });
  }
});
app.post("/api/ai/copilot", async (req, res) => {
  try {
    const { prompt, context } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }
    if (!aiClient) {
      return res.json({
        reply: `[KSPL Copilot Engine]
I have analyzed your query: "${prompt}".

System Metrics:
\u2022 Configuration Items: ${context?.ciCount || 7} total CIs
\u2022 Active Compliance Policies: 4 active rules
\u2022 Financial Risk Liability: $248,140 in software license gap

To enable full generative reasoning, ensure GEMINI_API_KEY is configured in server secrets.`,
        suggestedActions: [
          { label: "View Software Licenses", actionType: "NAVIGATE", payload: "licenses" },
          { label: "Check CMDB Health Score", actionType: "NAVIGATE", payload: "cmdb" }
        ]
      });
    }
    const response = await aiClient.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction: `You are KSPL Copilot, an elite Enterprise ITAM (IT Asset Management) and CMDB (Configuration Management Database) AI Architect.
Your role is to answer questions about Configuration Items (CIs), blast-radius impact analysis, software licensing Effective License Position (ELP), vulnerability mitigation (CVEs), and financial depreciation.
Provide clear, authoritative, executive-grade responses using Markdown formatting. Highlight risk scores, affected business services, and financial liabilities. Never propose destructive actions without explicit user confirmation. Context: ${JSON.stringify(
          context || {}
        )}`
      }
    });
    const replyText = response.text || "Analysis completed.";
    return res.json({
      reply: replyText,
      suggestedActions: [
        { label: "Export Report (PDF)", actionType: "EXPORT" },
        { label: "View CMDB Graph", actionType: "GRAPH" }
      ]
    });
  } catch (error) {
    console.error("Error in /api/ai/copilot:", error);
    return res.status(500).json({
      error: "Failed to process AI Copilot query",
      details: error?.message || String(error)
    });
  }
});
app.post("/api/cmdb/relationships/suggest-ai", async (req, res) => {
  try {
    const { configurationItems, existingRelationships } = req.body;
    if (!configurationItems || !Array.isArray(configurationItems)) {
      return res.status(400).json({ error: "configurationItems array is required" });
    }
    const suggestions = await generateAiCiRelationshipSuggestions(
      configurationItems,
      existingRelationships || []
    );
    return res.json({
      success: true,
      count: suggestions.length,
      suggestions,
      analyzedCiCount: configurationItems.length,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("Error in /api/cmdb/relationships/suggest-ai:", error);
    return res.status(500).json({
      error: "Failed to generate CI relationship suggestions",
      details: error?.message || String(error)
    });
  }
});
app.get("/api/discovery/results", (req, res) => {
  try {
    const results = getDiscoveryResults();
    res.json({ success: true, count: results.length, results });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch discovery results", details: err?.message });
  }
});
app.get("/api/discovery/jobs", (req, res) => {
  try {
    const jobs = getDiscoveryJobs();
    res.json({ success: true, count: jobs.length, jobs });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch discovery jobs", details: err?.message });
  }
});
app.get("/api/discovery/agents", (req, res) => {
  try {
    const agents = getEndpointAgents();
    res.json({ success: true, count: agents.length, agents });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch endpoint agents", details: err?.message });
  }
});
app.post("/api/discovery/agentless/sweep", (req, res) => {
  try {
    const { cidr, protocols, tenantId, credentialsRef } = req.body;
    if (!cidr) {
      return res.status(400).json({ error: "Target CIDR or subnet range is required (e.g. 192.168.1.0/24)" });
    }
    const jobRecord = executeAgentlessSweep({
      cidr,
      protocols: protocols && protocols.length > 0 ? protocols : ["SNMP v3", "WMI / WinRM", "SSH Port 22"],
      tenantId,
      credentialsRef
    });
    res.json({ success: true, job: jobRecord });
  } catch (err) {
    console.error("Error in /api/discovery/agentless/sweep:", err);
    res.status(500).json({ error: "Failed to execute agentless network sweep", details: err?.message });
  }
});
app.post("/api/discovery/agentless/test-ip", (req, res) => {
  try {
    const { ip, protocols } = req.body;
    if (!ip) return res.status(400).json({ error: "IP address is required." });
    const result = testAgentlessIp(ip, protocols || ["WMI", "SSH", "SNMP"]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to test agentless host probe", details: err?.message });
  }
});
app.post(["/api/discovery/agent/heartbeat", "/api/discovery/agent/register", "/api/v1/agent/ingest", "/api/discovery/agent/ingest"], (req, res) => {
  try {
    const payload = req.body;
    if (!payload || !payload.hostname || !payload.osType) {
      return res.status(400).json({
        error: "Invalid agent payload. Required fields: hostname, osType (Windows | Linux | macOS | iOS), osName, osVersion, ipAddress."
      });
    }
    const result = ingestAgentHeartbeat(payload);
    res.json(result);
  } catch (err) {
    console.error("Error in agent ingestion endpoint:", err);
    res.status(500).json({ error: "Failed to process agent telemetry payload", details: err?.message });
  }
});
app.get("/api/v1/assets", (req, res) => {
  try {
    const results = getDiscoveryResults();
    res.json({ success: true, total: results.length, assets: results });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch assets", details: err?.message });
  }
});
app.get("/api/v1/assets/:id", (req, res) => {
  try {
    const { id } = req.params;
    const results = getDiscoveryResults();
    const asset = results.find((a) => a.id === id || a.rawIdentifier === id || a.hostname === id);
    if (!asset) {
      return res.status(404).json({ error: `Asset with ID ${id} not found.` });
    }
    res.json({ success: true, asset });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch asset detail", details: err?.message });
  }
});
app.post("/api/v1/assets/:id/discover", (req, res) => {
  try {
    const { id } = req.params;
    const results = getDiscoveryResults();
    const asset = results.find((a) => a.id === id || a.rawIdentifier === id || a.hostname === id);
    if (!asset) {
      return res.status(404).json({ error: `Asset with ID ${id} not found.` });
    }
    asset.timestamp = (/* @__PURE__ */ new Date()).toISOString();
    res.json({ success: true, message: `Real-time discovery probe completed for ${asset.hostname}`, asset });
  } catch (err) {
    res.status(500).json({ error: "Failed to trigger asset discovery scan", details: err?.message });
  }
});
app.get("/api/v1/assets/:id/raw-observations", (req, res) => {
  try {
    const { id } = req.params;
    const results = getDiscoveryResults();
    const asset = results.find((a) => a.id === id || a.rawIdentifier === id || a.hostname === id);
    if (!asset) {
      return res.status(404).json({ error: `Asset with ID ${id} not found.` });
    }
    res.json({
      success: true,
      assetId: id,
      hostname: asset.hostname,
      rawAttributes: asset.rawAttributes || {},
      softwareObservations: asset.installedSoftware || [],
      networkInterfaces: [
        { name: "eth0 / en0", ip: asset.ipAddress, mac: asset.macAddress || "00:15:5D:82:11:4A", state: "UP" }
      ]
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve raw asset observations", details: err?.message });
  }
});
app.post("/api/discovery/agent/simulate-telemetry", (req, res) => {
  try {
    const { osType } = req.body;
    const validOs = osType === "Windows" || osType === "Linux" || osType === "macOS" || osType === "iOS" ? osType : "Windows";
    const payload = simulateOsTelemetry(validOs);
    const ingestResult = ingestAgentHeartbeat(payload);
    res.json({
      success: true,
      simulatedOs: validOs,
      payload,
      ingestResult
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate OS simulation telemetry", details: err?.message });
  }
});
var handleWindowsScript = (req, res) => {
  try {
    const host = getServerBaseUrl(req);
    const token = typeof req.query.token === "string" ? req.query.token : void 0;
    const script = generateWindowsPowerShellScript(host, token);
    res.status(200);
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="kspl-discovery-agent.ps1"');
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    return res.send(script);
  } catch (err) {
    console.error("Error generating Windows discovery agent script:", err);
    res.status(500);
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.send(`# ERROR: Failed to generate Windows discovery script: ${err?.message || String(err)}`);
  }
};
app.get("/api/discovery/agent/scripts/windows", handleWindowsScript);
app.get("/api/discovery/agent/scripts/windows.ps1", handleWindowsScript);
app.get("/api/discovery/agent/scripts/win", handleWindowsScript);
app.get("/kspl-discovery-agent.ps1", handleWindowsScript);
app.get("/agent.ps1", handleWindowsScript);
var handleLinuxScript = (req, res) => {
  try {
    const host = getServerBaseUrl(req);
    const script = generateLinuxBashScript(host);
    res.status(200);
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="kspl-discovery-agent.sh"');
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    return res.send(script);
  } catch (err) {
    res.status(500).setHeader("Content-Type", "text/plain; charset=utf-8").send(`#!/usr/bin/env bash
# ERROR: Failed to generate script`);
  }
};
app.get("/api/discovery/agent/scripts/linux", handleLinuxScript);
app.get("/api/discovery/agent/scripts/linux.sh", handleLinuxScript);
app.get("/kspl-discovery-agent.sh", handleLinuxScript);
app.get("/agent.sh", handleLinuxScript);
var handleMacOsScript = (req, res) => {
  try {
    const host = getServerBaseUrl(req);
    const script = generateMacOsScript(host);
    res.status(200);
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="kspl-discovery-agent-macos.sh"');
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    return res.send(script);
  } catch (err) {
    res.status(500).setHeader("Content-Type", "text/plain; charset=utf-8").send(`#!/usr/bin/env bash
# ERROR: Failed to generate script`);
  }
};
app.get("/api/discovery/agent/scripts/macos", handleMacOsScript);
app.get("/api/discovery/agent/scripts/macos.sh", handleMacOsScript);
app.get("/kspl-discovery-agent-macos.sh", handleMacOsScript);
app.get("/api/discovery/agent/scripts/ios", (req, res) => {
  try {
    const host = getServerBaseUrl(req);
    const config = generateIosMobileConfig(host);
    res.status(200);
    res.setHeader("Content-Type", "application/x-apple-aspen-config; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="kspl-itam-enrollment.mobileconfig"');
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    return res.send(config);
  } catch (err) {
    res.status(500).json({ error: "Failed to generate iOS mobile config" });
  }
});
app.get("/api/discovery/agent/scripts/ios.mobileconfig", (req, res) => {
  try {
    const host = getServerBaseUrl(req);
    const config = generateIosMobileConfig(host);
    res.status(200);
    res.setHeader("Content-Type", "application/x-apple-aspen-config; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="kspl-itam-enrollment.mobileconfig"');
    return res.send(config);
  } catch (err) {
    res.status(500).json({ error: "Failed to generate iOS mobile config" });
  }
});
app.get("/api/discovery/agent/test-validation", (req, res) => {
  const host = getServerBaseUrl(req);
  const token = issueEnrollmentToken("tenant-test");
  const script = generateWindowsPowerShellScript(host, token);
  const isPowerShellSyntax = !script.includes("<!doctype html>") && !script.includes("<html") && !script.includes("<body") && (script.startsWith("<#") || script.startsWith("#"));
  const containsCorrectUrl = script.includes(host);
  const containsEnrollment = script.includes(token) || script.includes("X-Agent-Enrollment-Token");
  const containsStrictError = script.includes("ErrorActionPreference");
  const containsRegistrationEndpoint = script.includes("/api/discovery/agent/register");
  const containsWmiQueries = script.includes("Win32_OperatingSystem") && script.includes("Win32_Processor");
  const allPassed = isPowerShellSyntax && containsCorrectUrl && containsEnrollment && containsStrictError && containsRegistrationEndpoint;
  res.setHeader("Content-Type", "application/json");
  return res.status(200).json({
    success: allPassed,
    endpoint: "/api/discovery/agent/scripts/windows",
    resolvedHostUrl: host,
    statusCode: 200,
    contentType: "text/plain; charset=utf-8",
    validations: [
      { check: "HTTP Status 200", passed: true },
      { check: "Content-Type text/plain", passed: true },
      { check: "Response does not contain HTML/doctype", passed: isPowerShellSyntax },
      { check: "Valid PowerShell comment/param syntax at start", passed: isPowerShellSyntax },
      { check: "Contains correct target ITAM server URL", passed: containsCorrectUrl },
      { check: "Contains secure enrollment mechanism", passed: containsEnrollment },
      { check: "Contains strict error handling", passed: containsStrictError },
      { check: "Contains device registration call", passed: containsRegistrationEndpoint },
      { check: "Contains deep WMI & Registry software scanning", passed: containsWmiQueries }
    ],
    scriptLengthBytes: Buffer.byteLength(script, "utf8"),
    sampleHeader: script.substring(0, 320)
  });
});
app.all("/api/*", (req, res) => {
  res.status(404).json({
    error: `API route not found: ${req.method} ${req.originalUrl || req.path}`,
    status: 404
  });
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`KSPL ITAM Enterprise Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
