import crypto from 'crypto';
import {
  User,
  UserRole,
  OrganizationTenant,
  MfaMethod,
  MfaSecretData,
  MfaResetRequest,
  SuperAdminPlatformOverview,
  RbacCapabilityItem,
  RbacMatrixPermissions,
  RbacMatrixState,
  CapabilityAccessLevel,
} from '../types';
import { users as initialUsers, tenants as initialTenants } from '../data/initialData';
import {
  setFirestoreDoc,
  getFirestoreDoc,
  getAllFirestoreDocs,
  deleteFirestoreDoc,
} from '../lib/firebase';

export interface UserAccount extends User {
  passwordHash: string;
  salt: string;
  phone?: string;
  jobTitle?: string;
  country?: string;
  status: 'Active' | 'Locked' | 'Disabled';
  createdAt: string;
  lastLoginAt?: string;
  onboardingCompleted?: boolean;
}

export interface SessionData {
  token: string;
  userId: string;
  tenantId: string;
  createdAt: string;
  expiresAt: string;
}

export interface ResetTokenData {
  token: string;
  userId: string;
  email: string;
  expiresAt: string;
  used: boolean;
}

export interface TempMfaSession {
  tempToken: string;
  userId: string;
  tenantId: string;
  mfaSetupRequired: boolean;
  mfaMethod?: MfaMethod;
  createdAt: string;
  expiresAt: string;
  attempts: number;
}

// In-Memory Authentication & MFA Data Stores
const userAccounts: Map<string, UserAccount> = new Map();
const tenantsStore: Map<string, OrganizationTenant> = new Map();
const activeSessions: Map<string, SessionData> = new Map();
const passwordResetTokens: Map<string, ResetTokenData> = new Map();
const loginAttempts: Map<string, { count: number; lockUntil: number }> = new Map();

// MFA & Super Admin Data Stores
const mfaSecretsStore: Map<string, MfaSecretData> = new Map();
const mfaResetRequestsStore: Map<string, MfaResetRequest> = new Map();
const tempMfaSessionsStore: Map<string, TempMfaSession> = new Map();
const pendingMfaSetupsStore: Map<string, { secret: string; method: MfaMethod; createdAt: string }> = new Map();

// TOTP & Cryptography Helpers (RFC 6238)
const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function generateBase32Secret(length = 20): string {
  const bytes = crypto.randomBytes(length);
  let secret = '';
  for (let i = 0; i < bytes.length; i++) {
    secret += BASE32_CHARS[bytes[i] % BASE32_CHARS.length];
  }
  return secret;
}

export function base32Decode(base32: string): Buffer {
  const clean = base32.toUpperCase().replace(/=+$/g, '').replace(/[^A-Z2-7]/g, '');
  let bits = '';
  for (let i = 0; i < clean.length; i++) {
    const val = BASE32_CHARS.indexOf(clean[i]);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substring(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

export function generateTotpCode(secretBase32: string, timeStepWindow = 0): string {
  const key = base32Decode(secretBase32);
  const epoch = Math.floor(Date.now() / 1000);
  const timeStep = 30;
  const counter = Math.floor(epoch / timeStep) + timeStepWindow;

  const buf = Buffer.alloc(8);
  buf.writeBigInt64BE(BigInt(counter), 0);

  const hmac = crypto.createHmac('sha1', key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return (binary % 1000000).toString().padStart(6, '0');
}

export function verifyTotpCode(secretBase32: string, token: string, window = 1): boolean {
  if (!token || token.trim().length !== 6 || !/^\d{6}$/.test(token.trim())) {
    return false;
  }
  const cleanToken = token.trim();
  for (let errorWindow = -window; errorWindow <= window; errorWindow++) {
    const calculated = generateTotpCode(secretBase32, errorWindow);
    if (crypto.timingSafeEqual(Buffer.from(calculated), Buffer.from(cleanToken))) {
      return true;
    }
  }
  return false;
}

// AES-256 Secret Encryption
const MFA_ENCRYPTION_KEY = (process.env.MFA_ENCRYPTION_KEY || 'kspl_itam_master_mfa_key_2026_prod!').padEnd(32, '0').substring(0, 32);

export function encryptMfaSecret(text: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(MFA_ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decryptMfaSecret(encryptedText: string): string {
  const parts = encryptedText.split(':');
  if (parts.length !== 3) return encryptedText;
  try {
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(MFA_ENCRYPTION_KEY), iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    return encryptedText;
  }
}

export function generateRecoveryCodes(count = 10): { plaintextCodes: string[]; hashedCodes: string[] } {
  const plaintextCodes: string[] = [];
  const hashedCodes: string[] = [];

  for (let i = 0; i < count; i++) {
    const code = `${crypto.randomBytes(2).toString('hex').toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    plaintextCodes.push(code);
    const hash = crypto.createHash('sha256').update(code).digest('hex');
    hashedCodes.push(hash);
  }

  return { plaintextCodes, hashedCodes };
}

export function hashRecoveryCode(code: string): string {
  const clean = code.trim().toUpperCase();
  return crypto.createHash('sha256').update(clean).digest('hex');
}

// Helper to hash password
export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter (A-Z).' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter (a-z).' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number (0-9).' };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character (!@#$%^&*...).' };
  }
  return { valid: true };
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

// Software Super Admin Initializer
const SUPER_ADMIN_EMAIL = 'jitin@ucliktechnologies.com';

function seedInitialAuthData() {
  if (tenantsStore.size === 0) {
    initialTenants.forEach((t) => tenantsStore.set(t.id, { ...t }));
  }

  if (!tenantsStore.has('tenant-platform-global')) {
    tenantsStore.set('tenant-platform-global', {
      id: 'tenant-platform-global',
      name: 'Uclik Technologies (Platform Global)',
      code: 'UCLIK-SUPER',
      region: 'US',
    });
  }

  if (userAccounts.size === 0) {
    initialUsers.forEach((u) => {
      const salt = generateSalt();
      const hash = hashPassword('Password123!', salt);
      const acc: UserAccount = {
        ...u,
        passwordHash: hash,
        salt: salt,
        jobTitle: u.role,
        country: 'United States',
        status: 'Active',
        createdAt: new Date().toISOString(),
        onboardingCompleted: true,
      };
      userAccounts.set(u.id, acc);
    });
  }

  // Ensure Global Software Super Admin Account
  const existingSuperAdmin = Array.from(userAccounts.values()).find(
    (u) => u.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()
  );

  if (!existingSuperAdmin) {
    const salt = generateSalt();
    const superAdminPassword = process.env.SUPER_ADMIN_INITIAL_PASSWORD || 'Password123!';
    const hash = hashPassword(superAdminPassword, salt);
    const superAdminAccount: UserAccount = {
      id: 'usr-super-admin-jitin',
      name: 'Software Super Admin',
      email: SUPER_ADMIN_EMAIL.toLowerCase(),
      role: 'SOFTWARE_SUPER_ADMIN',
      departmentId: 'd-1',
      locationId: 'loc-1',
      tenantId: 'tenant-platform-global',
      passwordHash: hash,
      salt: salt,
      jobTitle: 'Global Software Super Admin',
      phone: '+1 (800) 555-0199',
      country: 'United States',
      status: 'Active',
      createdAt: new Date().toISOString(),
      onboardingCompleted: true,
      mfaSetupRequired: false,
      mfaEnabled: false,
    };
    userAccounts.set(superAdminAccount.id, superAdminAccount);
  } else if (existingSuperAdmin.role !== 'SOFTWARE_SUPER_ADMIN') {
    existingSuperAdmin.role = 'SOFTWARE_SUPER_ADMIN';
  }

  // Ensure Client Admin Account
  const CLIENT_ADMIN_EMAIL = 'clientadmin@enterprise.com';
  const existingClientAdmin = Array.from(userAccounts.values()).find(
    (u) => u.email.toLowerCase() === CLIENT_ADMIN_EMAIL.toLowerCase()
  );

  if (!existingClientAdmin) {
    const salt = generateSalt();
    const clientAdminPassword = 'Password123!';
    const hash = hashPassword(clientAdminPassword, salt);
    const clientAdminAccount: UserAccount = {
      id: 'usr-client-admin',
      name: 'Client Organization Admin',
      email: CLIENT_ADMIN_EMAIL.toLowerCase(),
      role: 'CLIENT_ADMIN',
      departmentId: 'd-1',
      locationId: 'loc-1',
      tenantId: 'tenant-client-1',
      passwordHash: hash,
      salt: salt,
      jobTitle: 'Client Organization Administrator',
      phone: '+1 (555) 019-2831',
      country: 'United States',
      status: 'Active',
      createdAt: new Date().toISOString(),
      onboardingCompleted: true,
      mfaSetupRequired: false,
      mfaEnabled: false,
    };
    userAccounts.set(clientAdminAccount.id, clientAdminAccount);
  } else if (existingClientAdmin.role !== 'CLIENT_ADMIN' && existingClientAdmin.role !== 'Client Admin') {
    existingClientAdmin.role = 'CLIENT_ADMIN';
  }
}

seedInitialAuthData();

export function getAllTenants(): OrganizationTenant[] {
  seedInitialAuthData();
  return Array.from(tenantsStore.values());
}

export function getTenantById(id: string): OrganizationTenant | undefined {
  seedInitialAuthData();
  return tenantsStore.get(id);
}

export function registerUser(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword?: string;
  companyName: string;
  jobTitle?: string;
  phone?: string;
  country?: string;
  termsAccepted: boolean;
}): {
  success: boolean;
  error?: string;
  user?: User;
  tenant?: OrganizationTenant;
  token?: string;
  mfaRequired?: boolean;
  tempToken?: string;
  mfaSetupRequired?: boolean;
  mfaMethod?: MfaMethod;
} {
  seedInitialAuthData();

  const firstName = (data.firstName || '').trim();
  const lastName = (data.lastName || '').trim();
  const email = (data.email || '').trim().toLowerCase();
  const companyName = (data.companyName || '').trim();

  if (!firstName || !lastName) {
    return { success: false, error: 'First name and last name are required.' };
  }
  if (!email || !validateEmail(email)) {
    return { success: false, error: 'Please enter a valid work email address.' };
  }
  if (!companyName) {
    return { success: false, error: 'Company or Organization name is required.' };
  }
  if (!data.termsAccepted) {
    return { success: false, error: 'You must accept the Terms and Conditions to register.' };
  }
  if (data.confirmPassword && data.password !== data.confirmPassword) {
    return { success: false, error: 'Passwords do not match.' };
  }

  const pwdCheck = validatePasswordStrength(data.password);
  if (!pwdCheck.valid) {
    return { success: false, error: pwdCheck.message };
  }

  const existingUser = Array.from(userAccounts.values()).find((u) => u.email.toLowerCase() === email);
  if (existingUser) {
    return { success: false, error: 'An account with this work email already exists.' };
  }

  const tenantId = `tenant-${Date.now()}`;
  const codePrefix = companyName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toUpperCase() || 'KSPL';
  const newTenant: OrganizationTenant = {
    id: tenantId,
    name: companyName,
    code: `${codePrefix}-HQ`,
    region: (data.country === 'EU' || data.country === 'APAC') ? data.country : 'US',
  };
  tenantsStore.set(tenantId, newTenant);

  const salt = generateSalt();
  const hash = hashPassword(data.password, salt);

  const userId = `u-${Date.now()}`;
  const newUserAccount: UserAccount = {
    id: userId,
    name: `${firstName} ${lastName}`,
    email: email,
    role: 'CLIENT_SUPER_ADMIN',
    departmentId: 'd-1',
    locationId: 'loc-1',
    tenantId: tenantId,
    passwordHash: hash,
    salt: salt,
    jobTitle: data.jobTitle || 'IT Asset Administrator',
    phone: data.phone || '',
    country: data.country || 'United States',
    status: 'Active',
    createdAt: new Date().toISOString(),
    onboardingCompleted: false,
    mfaEnabled: false,
    mfaSetupRequired: true,
  };
  userAccounts.set(userId, newUserAccount);

  const tempToken = `kspl_mfa_temp_${crypto.randomBytes(32).toString('hex')}`;
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  tempMfaSessionsStore.set(tempToken, {
    tempToken,
    userId: newUserAccount.id,
    tenantId: newTenant.id,
    mfaSetupRequired: true,
    mfaMethod: 'google_authenticator',
    createdAt: new Date().toISOString(),
    expiresAt,
    attempts: 0,
  });

  const publicUser: User = {
    id: newUserAccount.id,
    name: newUserAccount.name,
    email: newUserAccount.email,
    role: newUserAccount.role,
    departmentId: newUserAccount.departmentId,
    locationId: newUserAccount.locationId,
    tenantId: newUserAccount.tenantId,
    mfaEnabled: false,
    mfaMethod: 'google_authenticator',
    mfaSetupRequired: true,
  };

  return {
    success: true,
    mfaRequired: true,
    tempToken,
    mfaSetupRequired: true,
    mfaMethod: 'google_authenticator',
    user: publicUser,
    tenant: newTenant,
  };
}

export function loginUser(
  emailInput: string,
  passwordInput: string,
  rememberMe: boolean = false
): {
  success: boolean;
  error?: string;
  user?: User;
  tenant?: OrganizationTenant;
  token?: string;
  mfaRequired?: boolean;
  tempToken?: string;
  mfaSetupRequired?: boolean;
  mfaMethod?: MfaMethod;
} {
  seedInitialAuthData();

  const email = (emailInput || '').trim().toLowerCase();
  const password = passwordInput || '';

  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' };
  }

  // Brute force rate limiting check
  const attemptInfo = loginAttempts.get(email);
  if (attemptInfo && attemptInfo.lockUntil > Date.now()) {
    const minsLeft = Math.ceil((attemptInfo.lockUntil - Date.now()) / 60000);
    return {
      success: false,
      error: `Too many failed attempts. Account temporarily locked for ${minsLeft} minute(s).`,
    };
  }

  const account = Array.from(userAccounts.values()).find((u) => u.email.toLowerCase() === email);

  if (!account) {
    recordFailedAttempt(email);
    return { success: false, error: 'Invalid email or password.' };
  }

  if (account.status !== 'Active') {
    return { success: false, error: 'Your account has been locked or disabled by an administrator.' };
  }

  const computedHash = hashPassword(password, account.salt);
  if (computedHash !== account.passwordHash) {
    recordFailedAttempt(email);
    return { success: false, error: 'Invalid email or password.' };
  }

  loginAttempts.delete(email);

  // Check MFA Requirement (Mandatory for ALL users)
  const mfaData = mfaSecretsStore.get(account.id);
  const isSuperAdmin = account.role === 'SOFTWARE_SUPER_ADMIN';
  const hasConfiguredMfa = (mfaData && mfaData.mfaEnabled) || (account.mfaEnabled && !account.mfaSetupRequired);
  const requiresMfa = true;

  if (requiresMfa) {
    const tempToken = `kspl_mfa_temp_${crypto.randomBytes(32).toString('hex')}`;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    tempMfaSessionsStore.set(tempToken, {
      tempToken,
      userId: account.id,
      tenantId: account.tenantId,
      mfaSetupRequired: !hasConfiguredMfa,
      mfaMethod: mfaData?.mfaMethod || account.mfaMethod || 'google_authenticator',
      createdAt: new Date().toISOString(),
      expiresAt,
      attempts: 0,
    });

    const tenant = tenantsStore.get(account.tenantId) || initialTenants[0];
    const publicUser: User = {
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
      departmentId: account.departmentId,
      locationId: account.locationId,
      tenantId: account.tenantId,
      mfaEnabled: hasConfiguredMfa,
      mfaMethod: mfaData?.mfaMethod || account.mfaMethod || 'google_authenticator',
      mfaSetupRequired: !hasConfiguredMfa,
    };

    return {
      success: true,
      mfaRequired: true,
      tempToken,
      mfaSetupRequired: !hasConfiguredMfa,
      mfaMethod: mfaData?.mfaMethod || account.mfaMethod || 'google_authenticator',
      user: publicUser,
      tenant,
    };
  }

  // Direct login without MFA
  account.lastLoginAt = new Date().toISOString();
  const durationMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  const token = `kspl_sess_${crypto.randomBytes(32).toString('hex')}`;
  const expiresAt = new Date(Date.now() + durationMs).toISOString();

  activeSessions.set(token, {
    token,
    userId: account.id,
    tenantId: account.tenantId,
    createdAt: new Date().toISOString(),
    expiresAt,
  });

  const tenant = tenantsStore.get(account.tenantId) || initialTenants[0];
  const publicUser: User = {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    departmentId: account.departmentId,
    locationId: account.locationId,
    tenantId: account.tenantId,
    mfaEnabled: false,
  };

  return {
    success: true,
    user: publicUser,
    tenant,
    token,
  };
}

// MFA Verification Logic
export function verifyMfaLogin(
  tempToken: string,
  code: string
): { success: boolean; error?: string; user?: User; tenant?: OrganizationTenant; token?: string } {
  seedInitialAuthData();

  if (!tempToken) {
    return { success: false, error: 'MFA session token is missing.' };
  }

  const tempSession = tempMfaSessionsStore.get(tempToken);
  if (!tempSession || new Date(tempSession.expiresAt).getTime() < Date.now()) {
    tempMfaSessionsStore.delete(tempToken);
    return { success: false, error: 'MFA verification session expired. Please sign in again.' };
  }

  if (tempSession.attempts >= 5) {
    tempMfaSessionsStore.delete(tempToken);
    return { success: false, error: 'Too many incorrect verification attempts. Please sign in again.' };
  }

  tempSession.attempts += 1;

  const account = userAccounts.get(tempSession.userId);
  if (!account || account.status !== 'Active') {
    return { success: false, error: 'Account not found or inactive.' };
  }

  const mfaData = mfaSecretsStore.get(account.id);
  if (!mfaData || !mfaData.mfaEnabled) {
    return { success: false, error: 'MFA is not fully configured for this account.' };
  }

  const secretPlain = decryptMfaSecret(mfaData.encryptedSecret);
  const isValid = verifyTotpCode(secretPlain, code, 1);

  if (!isValid) {
    return { success: false, error: 'Invalid 6-digit verification code. Please check your authenticator app.' };
  }

  // Verification Successful!
  tempMfaSessionsStore.delete(tempToken);
  mfaData.lastUsedAt = new Date().toISOString();
  account.lastLoginAt = new Date().toISOString();

  // Generate full session token
  const token = `kspl_sess_${crypto.randomBytes(32).toString('hex')}`;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  activeSessions.set(token, {
    token,
    userId: account.id,
    tenantId: account.tenantId,
    createdAt: new Date().toISOString(),
    expiresAt,
  });

  const tenant = tenantsStore.get(account.tenantId) || initialTenants[0];
  const publicUser: User = {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    departmentId: account.departmentId,
    locationId: account.locationId,
    tenantId: account.tenantId,
    mfaEnabled: true,
    mfaMethod: mfaData.mfaMethod,
  };

  return {
    success: true,
    user: publicUser,
    tenant,
    token,
  };
}

// Single-Use Recovery Code Login Verification
export function verifyMfaRecoveryLogin(
  tempToken: string,
  recoveryCode: string
): { success: boolean; error?: string; user?: User; tenant?: OrganizationTenant; token?: string } {
  seedInitialAuthData();

  if (!tempToken || !recoveryCode) {
    return { success: false, error: 'Recovery code or session token is missing.' };
  }

  const tempSession = tempMfaSessionsStore.get(tempToken);
  if (!tempSession || new Date(tempSession.expiresAt).getTime() < Date.now()) {
    tempMfaSessionsStore.delete(tempToken);
    return { success: false, error: 'Session expired. Please sign in again.' };
  }

  const account = userAccounts.get(tempSession.userId);
  if (!account || account.status !== 'Active') {
    return { success: false, error: 'Account not found or inactive.' };
  }

  const mfaData = mfaSecretsStore.get(account.id);
  if (!mfaData || !mfaData.mfaEnabled || !mfaData.recoveryCodesHash || mfaData.recoveryCodesHash.length === 0) {
    return { success: false, error: 'No recovery codes are available for this account.' };
  }

  const inputHash = hashRecoveryCode(recoveryCode);
  const codeIndex = mfaData.recoveryCodesHash.indexOf(inputHash);

  if (codeIndex === -1) {
    return { success: false, error: 'Invalid or previously used recovery code.' };
  }

  // Invalidate single-use recovery code
  mfaData.recoveryCodesHash.splice(codeIndex, 1);
  mfaData.lastUsedAt = new Date().toISOString();
  tempMfaSessionsStore.delete(tempToken);
  account.lastLoginAt = new Date().toISOString();

  // Create full session token
  const token = `kspl_sess_${crypto.randomBytes(32).toString('hex')}`;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  activeSessions.set(token, {
    token,
    userId: account.id,
    tenantId: account.tenantId,
    createdAt: new Date().toISOString(),
    expiresAt,
  });

  const tenant = tenantsStore.get(account.tenantId) || initialTenants[0];
  const publicUser: User = {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    departmentId: account.departmentId,
    locationId: account.locationId,
    tenantId: account.tenantId,
    mfaEnabled: true,
    mfaMethod: mfaData.mfaMethod,
  };

  return {
    success: true,
    user: publicUser,
    tenant,
    token,
  };
}

// Initiate MFA Enrollment Setup
export function initiateMfaSetup(
  userIdOrTempToken: string,
  method: MfaMethod
): { success: boolean; error?: string; secret?: string; otpauthUrl?: string; userId?: string } {
  seedInitialAuthData();

  let resolvedUserId = userIdOrTempToken;
  if (tempMfaSessionsStore.has(userIdOrTempToken)) {
    const session = tempMfaSessionsStore.get(userIdOrTempToken);
    if (session) resolvedUserId = session.userId;
  }

  const account = userAccounts.get(resolvedUserId);
  if (!account) {
    return { success: false, error: 'User account not found.' };
  }

  const secret = generateBase32Secret(20);
  const issuer = 'KSPL ITAM Platform';
  const encodedEmail = encodeURIComponent(account.email);
  const encodedIssuer = encodeURIComponent(issuer);
  const otpauthUrl = `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;

  pendingMfaSetupsStore.set(account.id, {
    secret,
    method,
    createdAt: new Date().toISOString(),
  });

  return {
    success: true,
    secret,
    otpauthUrl,
    userId: account.id,
  };
}

// Confirm MFA Setup
export function confirmMfaSetup(
  userIdOrTempToken: string,
  code: string
): { success: boolean; error?: string; recoveryCodes?: string[]; user?: User; tenant?: OrganizationTenant; token?: string } {
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
    return { success: false, error: 'User account not found.' };
  }

  const pending = pendingMfaSetupsStore.get(account.id);
  if (!pending) {
    return { success: false, error: 'No active MFA setup session found. Please restart MFA setup.' };
  }

  const isValid = verifyTotpCode(pending.secret, code, 1);
  if (!isValid) {
    return { success: false, error: 'Invalid 6-digit verification code. Please check your authenticator application.' };
  }

  // Generate 10 single-use recovery codes
  const { plaintextCodes, hashedCodes } = generateRecoveryCodes(10);
  const encryptedSecret = encryptMfaSecret(pending.secret);

  const mfaData: MfaSecretData = {
    userId: account.id,
    userEmail: account.email,
    mfaEnabled: true,
    mfaMethod: pending.method,
    encryptedSecret,
    recoveryCodesHash: hashedCodes,
    verifiedAt: new Date().toISOString(),
    lastUsedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mfaSecretsStore.set(account.id, mfaData);
  pendingMfaSetupsStore.delete(account.id);

  account.mfaEnabled = true;
  account.mfaMethod = pending.method;
  account.mfaSetupRequired = false;

  let sessionToken: string | undefined;
  let tenant: OrganizationTenant | undefined;

  if (isTempSession) {
    tempMfaSessionsStore.delete(userIdOrTempToken);
    account.lastLoginAt = new Date().toISOString();
    sessionToken = `kspl_sess_${crypto.randomBytes(32).toString('hex')}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    activeSessions.set(sessionToken, {
      token: sessionToken,
      userId: account.id,
      tenantId: account.tenantId,
      createdAt: new Date().toISOString(),
      expiresAt,
    });
    tenant = tenantsStore.get(account.tenantId) || initialTenants[0];
  }

  const publicUser: User = {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    departmentId: account.departmentId,
    locationId: account.locationId,
    tenantId: account.tenantId,
    mfaEnabled: true,
    mfaMethod: pending.method,
  };

  return {
    success: true,
    recoveryCodes: plaintextCodes,
    user: publicUser,
    tenant,
    token: sessionToken,
  };
}

// Change Authenticator (Requires re-authentication)
export function changeMfaAuthenticator(
  userId: string,
  currentPasswordInput: string,
  currentMfaCode: string,
  newMethod: MfaMethod
): { success: boolean; error?: string; secret?: string; otpauthUrl?: string } {
  seedInitialAuthData();

  const account = userAccounts.get(userId);
  if (!account) {
    return { success: false, error: 'User account not found.' };
  }

  // Verify Current Password
  const hash = hashPassword(currentPasswordInput, account.salt);
  if (hash !== account.passwordHash) {
    return { success: false, error: 'Current password verification failed.' };
  }

  // Verify Current MFA Code
  const mfaData = mfaSecretsStore.get(account.id);
  if (mfaData && mfaData.mfaEnabled) {
    const plainSecret = decryptMfaSecret(mfaData.encryptedSecret);
    const valid = verifyTotpCode(plainSecret, currentMfaCode, 1);
    if (!valid) {
      return { success: false, error: 'Current authenticator verification failed.' };
    }
  }

  return initiateMfaSetup(userId, newMethod);
}

// Regenerate Recovery Codes
export function regenerateRecoveryCodes(
  userId: string,
  currentMfaCode: string
): { success: boolean; error?: string; recoveryCodes?: string[] } {
  seedInitialAuthData();

  const account = userAccounts.get(userId);
  if (!account) return { success: false, error: 'User account not found.' };

  const mfaData = mfaSecretsStore.get(account.id);
  if (!mfaData || !mfaData.mfaEnabled) {
    return { success: false, error: 'MFA is not enabled on this account.' };
  }

  const plainSecret = decryptMfaSecret(mfaData.encryptedSecret);
  const isValid = verifyTotpCode(plainSecret, currentMfaCode, 1);
  if (!isValid) {
    return { success: false, error: 'Invalid 6-digit verification code.' };
  }

  const { plaintextCodes, hashedCodes } = generateRecoveryCodes(10);
  mfaData.recoveryCodesHash = hashedCodes;
  mfaData.updatedAt = new Date().toISOString();

  return { success: true, recoveryCodes: plaintextCodes };
}

// MFA Reset Request Workflow
export function createMfaResetRequest(
  userIdOrEmail: string,
  reason: string
): { success: boolean; message: string; requestId?: string } {
  seedInitialAuthData();

  const query = (userIdOrEmail || '').trim().toLowerCase();
  const account = Array.from(userAccounts.values()).find(
    (u) => u.id === query || u.email.toLowerCase() === query
  );

  if (!account) {
    return {
      success: true,
      message: 'If an account exists, an MFA reset request has been dispatched to the Software Super Admin.',
    };
  }

  const tenant = tenantsStore.get(account.tenantId);
  const requestId = `mfa-req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  const newRequest: MfaResetRequest = {
    requestId,
    userId: account.id,
    userName: account.name,
    userEmail: account.email,
    tenantId: account.tenantId,
    tenantName: tenant?.name || 'Organization',
    mfaMethod: account.mfaMethod || 'google_authenticator',
    requestReason: reason || 'Lost authenticator application or device',
    status: 'Pending',
    requestedAt: new Date().toISOString(),
  };

  mfaResetRequestsStore.set(requestId, newRequest);

  return {
    success: true,
    message: 'MFA Reset Request submitted successfully to Platform Software Super Admin.',
    requestId,
  };
}

// Super Admin List MFA Requests
export function getAllMfaResetRequests(): MfaResetRequest[] {
  seedInitialAuthData();
  return Array.from(mfaResetRequestsStore.values()).sort(
    (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
  );
}

// Super Admin Approve MFA Reset
export function approveMfaResetRequest(
  requestId: string,
  reviewerName: string = 'Jitin (Software Super Admin)'
): { success: boolean; error?: string; message?: string } {
  seedInitialAuthData();

  const req = mfaResetRequestsStore.get(requestId);
  if (!req) {
    return { success: false, error: 'MFA reset request not found.' };
  }

  if (req.status !== 'Pending') {
    return { success: false, error: `Request has already been ${req.status.toLowerCase()}.` };
  }

  const account = userAccounts.get(req.userId);
  if (account) {
    // Invalidate existing MFA
    mfaSecretsStore.delete(account.id);
    account.mfaEnabled = false;
    account.mfaSetupRequired = true; // Force setup on next password login!
    account.mfaMethod = undefined;
  }

  req.status = 'Approved';
  req.reviewedBy = reviewerName;
  req.reviewedAt = new Date().toISOString();
  req.adminNotes = 'Approved by Software Super Admin. Invalidated old TOTP secret and recovery codes.';

  return {
    success: true,
    message: `MFA reset request for ${req.userEmail} approved successfully. User will be required to re-enroll MFA on next login.`,
  };
}

// Super Admin Reject MFA Reset
export function rejectMfaResetRequest(
  requestId: string,
  reason: string,
  reviewerName: string = 'Jitin (Software Super Admin)'
): { success: boolean; error?: string; message?: string } {
  seedInitialAuthData();

  const req = mfaResetRequestsStore.get(requestId);
  if (!req) {
    return { success: false, error: 'MFA reset request not found.' };
  }

  if (req.status !== 'Pending') {
    return { success: false, error: `Request has already been ${req.status.toLowerCase()}.` };
  }

  req.status = 'Rejected';
  req.reviewedBy = reviewerName;
  req.reviewedAt = new Date().toISOString();
  req.adminNotes = reason || 'Request rejected by Software Super Admin due to insufficient identity verification.';

  return {
    success: true,
    message: `MFA reset request for ${req.userEmail} rejected. MFA remains active.`,
  };
}

// Software Super Admin Platform Metrics & Overview
export function getSuperAdminPlatformOverview(): SuperAdminPlatformOverview {
  seedInitialAuthData();

  const totalTenants = tenantsStore.size;
  const totalUsers = userAccounts.size;
  const activeMfaUsers = Array.from(userAccounts.values()).filter(
    (u) => u.mfaEnabled || mfaSecretsStore.has(u.id)
  ).length;

  const mfaAdoptionPercent = totalUsers > 0 ? Math.round((activeMfaUsers / totalUsers) * 100) : 100;
  const pendingRequests = Array.from(mfaResetRequestsStore.values()).filter((r) => r.status === 'Pending').length;

  return {
    totalTenants,
    totalUsers,
    activeMfaUsers,
    mfaAdoptionPercent,
    pendingMfaResetRequests: pendingRequests,
    activeSessionsCount: activeSessions.size,
    systemStatus: 'Optimal',
  };
}

export function getGlobalUsersList(
  search?: string,
  tenantFilter?: string,
  mfaFilter?: string
): (UserAccount & { tenantName: string })[] {
  seedInitialAuthData();

  let list = Array.from(userAccounts.values()).map((acc) => {
    const tenant = tenantsStore.get(acc.tenantId);
    return {
      ...acc,
      tenantName: tenant ? tenant.name : 'Unknown Organization',
    };
  });

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.tenantName.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }

  if (tenantFilter && tenantFilter !== 'ALL') {
    list = list.filter((u) => u.tenantId === tenantFilter);
  }

  if (mfaFilter && mfaFilter !== 'ALL') {
    if (mfaFilter === 'ENABLED') list = list.filter((u) => u.mfaEnabled);
    if (mfaFilter === 'DISABLED') list = list.filter((u) => !u.mfaEnabled);
    if (mfaFilter === 'SUPER_ADMIN') list = list.filter((u) => u.role === 'SOFTWARE_SUPER_ADMIN');
  }

  return list;
}

export function recordFailedAttempt(email: string) {
  const current = loginAttempts.get(email) || { count: 0, lockUntil: 0 };
  current.count += 1;
  if (current.count >= 5) {
    current.lockUntil = Date.now() + 5 * 60 * 1000;
  }
  loginAttempts.set(email, current);
}

export function getSession(token: string): { user?: User; tenant?: OrganizationTenant } | null {
  seedInitialAuthData();

  if (!token) return null;
  const session = activeSessions.get(token);
  if (!session) return null;

  if (new Date(session.expiresAt).getTime() < Date.now()) {
    activeSessions.delete(token);
    return null;
  }

  const account = userAccounts.get(session.userId);
  if (!account || account.status !== 'Active') return null;

  const tenant = tenantsStore.get(session.tenantId) || initialTenants[0];

  const mfaData = mfaSecretsStore.get(account.id);
  const publicUser: User = {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    departmentId: account.departmentId,
    locationId: account.locationId,
    tenantId: account.tenantId,
    mfaEnabled: account.mfaEnabled || (mfaData && mfaData.mfaEnabled) || false,
    mfaMethod: mfaData?.mfaMethod || account.mfaMethod,
  };

  return { user: publicUser, tenant };
}

export function logoutSession(token: string): boolean {
  if (!token) return false;
  return activeSessions.delete(token);
}

export function requestPasswordReset(emailInput: string): { success: boolean; message: string; resetToken?: string } {
  seedInitialAuthData();

  const email = (emailInput || '').trim().toLowerCase();
  if (!email || !validateEmail(email)) {
    return { success: false, message: 'Please enter a valid work email address.' };
  }

  const account = Array.from(userAccounts.values()).find((u) => u.email.toLowerCase() === email);

  if (!account) {
    return {
      success: true,
      message: 'If an account exists with this email address, a password reset link has been dispatched.',
    };
  }

  const resetToken = `kspl_reset_${crypto.randomBytes(24).toString('hex')}`;
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  passwordResetTokens.set(resetToken, {
    token: resetToken,
    userId: account.id,
    email: account.email,
    expiresAt,
    used: false,
  });

  return {
    success: true,
    message: 'If an account exists with this email address, a password reset link has been dispatched.',
    resetToken,
  };
}

export function resetPassword(
  resetToken: string,
  newPassword: string,
  confirmPassword?: string
): { success: boolean; error?: string; message?: string } {
  seedInitialAuthData();

  if (!resetToken) {
    return { success: false, error: 'Password reset token is missing or invalid.' };
  }

  const tokenData = passwordResetTokens.get(resetToken);
  if (!tokenData || tokenData.used || new Date(tokenData.expiresAt).getTime() < Date.now()) {
    return { success: false, error: 'Password reset token is invalid, expired, or has already been used.' };
  }

  if (confirmPassword && newPassword !== confirmPassword) {
    return { success: false, error: 'Passwords do not match.' };
  }

  const pwdCheck = validatePasswordStrength(newPassword);
  if (!pwdCheck.valid) {
    return { success: false, error: pwdCheck.message };
  }

  const account = userAccounts.get(tokenData.userId);
  if (!account) {
    return { success: false, error: 'Associated user account not found.' };
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
    message: 'Password reset successfully. You may now sign in with your new credentials.',
  };
}

export function completeOnboarding(
  userId: string,
  tenantId: string,
  data: { companyName?: string; logo?: string; region?: string; currency?: string; timezone?: string }
): { success: boolean; tenant?: OrganizationTenant } {
  seedInitialAuthData();

  const tenant = tenantsStore.get(tenantId);
  if (tenant) {
    if (data.companyName) tenant.name = data.companyName;
    if (data.region) tenant.region = (data.region === 'EU' || data.region === 'APAC') ? data.region : 'US';
  }

  const account = userAccounts.get(userId);
  if (account) {
    account.onboardingCompleted = true;
  }

  return { success: true, tenant };
}

export function updateUserProfile(
  userId: string,
  data: { firstName?: string; lastName?: string; jobTitle?: string; phone?: string; country?: string; password?: string }
): { success: boolean; error?: string; user?: User } {
  seedInitialAuthData();

  const account = userAccounts.get(userId);
  if (!account) {
    return { success: false, error: 'User account not found.' };
  }

  if (data.firstName || data.lastName) {
    const f = data.firstName !== undefined ? data.firstName.trim() : account.name.split(' ')[0];
    const l = data.lastName !== undefined ? data.lastName.trim() : account.name.split(' ').slice(1).join(' ');
    account.name = `${f} ${l}`.trim();
  }

  if (data.jobTitle !== undefined) account.jobTitle = data.jobTitle.trim();
  if (data.phone !== undefined) account.phone = data.phone.trim();
  if (data.country !== undefined) account.country = data.country.trim();

  if (data.password) {
    const pwdCheck = validatePasswordStrength(data.password);
    if (!pwdCheck.valid) {
      return { success: false, error: pwdCheck.message };
    }
    const newSalt = generateSalt();
    account.salt = newSalt;
    account.passwordHash = hashPassword(data.password, newSalt);
  }

  const publicUser: User = {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    departmentId: account.departmentId,
    locationId: account.locationId,
    tenantId: account.tenantId,
    mfaEnabled: account.mfaEnabled,
    mfaMethod: account.mfaMethod,
  };

  return { success: true, user: publicUser };
}

export function provisionUserByAdmin(data: {
  name: string;
  email: string;
  role: UserRole;
  departmentId?: string;
  locationId?: string;
  tenantId: string;
  jobTitle?: string;
  password?: string;
}): { success: boolean; error?: string; user?: User } {
  seedInitialAuthData();

  const name = (data.name || '').trim();
  const email = (data.email || '').trim().toLowerCase();

  if (!name || !email) {
    return { success: false, error: 'Name and email are required to provision a user.' };
  }

  // Check duplicate email
  for (const acc of userAccounts.values()) {
    if (acc.email.toLowerCase() === email) {
      return { success: false, error: 'A user with this email address already exists.' };
    }
  }

  const salt = generateSalt();
  const initialPassword = data.password || 'Password123!';
  const hash = hashPassword(initialPassword, salt);
  const userId = `usr-${crypto.randomBytes(6).toString('hex')}`;

  const newUserAccount: UserAccount = {
    id: userId,
    name,
    email,
    role: data.role || 'Employee',
    departmentId: data.departmentId || 'd-1',
    locationId: data.locationId || 'loc-1',
    tenantId: data.tenantId,
    passwordHash: hash,
    salt,
    jobTitle: data.jobTitle || 'Team Member',
    phone: '',
    country: 'United States',
    status: 'Active',
    createdAt: new Date().toISOString(),
    onboardingCompleted: true,
    mfaEnabled: false,
    mfaSetupRequired: true,
  };

  userAccounts.set(userId, newUserAccount);

  const publicUser: User = {
    id: newUserAccount.id,
    name: newUserAccount.name,
    email: newUserAccount.email,
    role: newUserAccount.role,
    departmentId: newUserAccount.departmentId,
    locationId: newUserAccount.locationId,
    tenantId: newUserAccount.tenantId,
    mfaEnabled: false,
    mfaMethod: 'google_authenticator',
    mfaSetupRequired: true,
  };

  return { success: true, user: publicUser };
}

export function updateUserRoleAndStatus(
  userId: string,
  data: { role?: UserRole; status?: 'Active' | 'Locked' | 'Disabled'; departmentId?: string; jobTitle?: string }
): { success: boolean; error?: string; user?: User } {
  seedInitialAuthData();

  const account = userAccounts.get(userId);
  if (!account) {
    return { success: false, error: 'User account not found.' };
  }

  if (data.role) account.role = data.role;
  if (data.status) account.status = data.status;
  if (data.departmentId) account.departmentId = data.departmentId;
  if (data.jobTitle) account.jobTitle = data.jobTitle;

  const publicUser: User = {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    departmentId: account.departmentId,
    locationId: account.locationId,
    tenantId: account.tenantId,
    mfaEnabled: account.mfaEnabled,
    mfaMethod: account.mfaMethod,
  };

  return { success: true, user: publicUser };
}

// ==========================================
// DYNAMIC RBAC PERMISSION MATRIX ENGINE
// ==========================================

export const DEFAULT_RBAC_CAPABILITIES: RbacCapabilityItem[] = [
  {
    id: 'multiTenantGovernance',
    name: 'Multi-Tenant Global Governance',
    category: 'Administration',
    description: 'Manage cross-tenant isolation, enterprise data boundaries, and global system configurations.',
  },
  {
    id: 'userProvisioning',
    name: 'User Provisioning & Role Assignment',
    category: 'Identity & Access',
    description: 'Create user credentials, assign functional RBAC roles, and manage active status.',
  },
  {
    id: 'cmdbManage',
    name: 'CMDB Assets & Topology Editor',
    category: 'ITAM & CMDB',
    description: 'Create, update, and manage Configuration Items (CIs), relationships, and discovery assets.',
  },
  {
    id: 'reconciliationEngine',
    name: 'Reconciliation Rules & Drift Engine',
    category: 'ITAM & CMDB',
    description: 'Configure multi-source reconciliation priority rules, identification criteria, and drift thresholds.',
  },
  {
    id: 'softwareLicensesElp',
    name: 'Software Licenses & ELP Calculation',
    category: 'Software Asset Management',
    description: 'Manage publisher contracts, license entitlements, installation compliance, and Effective License Position.',
  },
  {
    id: 'contractsFinancials',
    name: 'Contracts, POs & Depreciation',
    category: 'Finance & Procurement',
    description: 'Author purchase orders, vendor warranties, MACRS/straight-line depreciation, and financial ledgers.',
  },
  {
    id: 'cveSecurity',
    name: 'CVE Vulnerabilities & Compliance Rules',
    category: 'SecOps & Compliance',
    description: 'Inspect CVE severity feeds, patch tracking, security SLAs, and compliance benchmarks.',
  },
  {
    id: 'hardwareWipeCertificates',
    name: 'Hardware Disposal & Wipe Certificates',
    category: 'Asset Lifecycle',
    description: 'Authorize hardware decommissioning, asset disposition, and cryptographic NIST 800-88 certificates.',
  },
  {
    id: 'selfServiceCatalog',
    name: 'Self-Service Catalog & Requests',
    category: 'Employee Portal',
    description: 'Browse approved hardware/software catalog, raise equipment requests, and view assigned items.',
  },
  {
    id: 'mfaResetAuthorization',
    name: 'MFA Reset Queue Authorization',
    category: 'Identity & Access',
    description: 'Review and approve/reject emergency multi-factor authenticator reset tickets.',
  },
  {
    id: 'auditLogExport',
    name: 'System Audit Log & Compliance Export',
    category: 'SecOps & Compliance',
    description: 'Export immutable tamper-proof system logs, user access traces, and compliance reports.',
  },
  {
    id: 'apiTokenManagement',
    name: 'REST API & Webhook Integrations',
    category: 'Administration',
    description: 'Generate developer API keys, configure webhooks, and manage enterprise integration connectors.',
  },
];

export const DEFAULT_RBAC_MATRIX: RbacMatrixPermissions = {
  multiTenantGovernance: {
    SOFTWARE_SUPER_ADMIN: 'AUTHORIZED',
    CLIENT_ADMIN: 'DENIED',
    'ITAM Admin': 'DENIED',
    'CMDB Admin': 'DENIED',
    Security: 'DENIED',
    Finance: 'DENIED',
    Employee: 'DENIED',
  },
  userProvisioning: {
    SOFTWARE_SUPER_ADMIN: 'AUTHORIZED',
    CLIENT_ADMIN: 'AUTHORIZED',
    'ITAM Admin': 'DENIED',
    'CMDB Admin': 'DENIED',
    Security: 'DENIED',
    Finance: 'DENIED',
    Employee: 'DENIED',
  },
  cmdbManage: {
    SOFTWARE_SUPER_ADMIN: 'AUTHORIZED',
    CLIENT_ADMIN: 'AUTHORIZED',
    'ITAM Admin': 'AUTHORIZED',
    'CMDB Admin': 'AUTHORIZED',
    Security: 'READ_ONLY',
    Finance: 'READ_ONLY',
    Employee: 'DENIED',
  },
  reconciliationEngine: {
    SOFTWARE_SUPER_ADMIN: 'AUTHORIZED',
    CLIENT_ADMIN: 'AUTHORIZED',
    'ITAM Admin': 'READ_ONLY',
    'CMDB Admin': 'AUTHORIZED',
    Security: 'READ_ONLY',
    Finance: 'DENIED',
    Employee: 'DENIED',
  },
  softwareLicensesElp: {
    SOFTWARE_SUPER_ADMIN: 'AUTHORIZED',
    CLIENT_ADMIN: 'AUTHORIZED',
    'ITAM Admin': 'AUTHORIZED',
    'CMDB Admin': 'READ_ONLY',
    Security: 'READ_ONLY',
    Finance: 'READ_ONLY',
    Employee: 'DENIED',
  },
  contractsFinancials: {
    SOFTWARE_SUPER_ADMIN: 'AUTHORIZED',
    CLIENT_ADMIN: 'AUTHORIZED',
    'ITAM Admin': 'READ_ONLY',
    'CMDB Admin': 'DENIED',
    Security: 'DENIED',
    Finance: 'AUTHORIZED',
    Employee: 'DENIED',
  },
  cveSecurity: {
    SOFTWARE_SUPER_ADMIN: 'AUTHORIZED',
    CLIENT_ADMIN: 'AUTHORIZED',
    'ITAM Admin': 'READ_ONLY',
    'CMDB Admin': 'READ_ONLY',
    Security: 'AUTHORIZED',
    Finance: 'DENIED',
    Employee: 'DENIED',
  },
  hardwareWipeCertificates: {
    SOFTWARE_SUPER_ADMIN: 'AUTHORIZED',
    CLIENT_ADMIN: 'AUTHORIZED',
    'ITAM Admin': 'AUTHORIZED',
    'CMDB Admin': 'DENIED',
    Security: 'AUTHORIZED',
    Finance: 'READ_ONLY',
    Employee: 'DENIED',
  },
  selfServiceCatalog: {
    SOFTWARE_SUPER_ADMIN: 'AUTHORIZED',
    CLIENT_ADMIN: 'AUTHORIZED',
    'ITAM Admin': 'AUTHORIZED',
    'CMDB Admin': 'AUTHORIZED',
    Security: 'AUTHORIZED',
    Finance: 'AUTHORIZED',
    Employee: 'AUTHORIZED',
  },
  mfaResetAuthorization: {
    SOFTWARE_SUPER_ADMIN: 'AUTHORIZED',
    CLIENT_ADMIN: 'AUTHORIZED',
    'ITAM Admin': 'DENIED',
    'CMDB Admin': 'DENIED',
    Security: 'DENIED',
    Finance: 'DENIED',
    Employee: 'DENIED',
  },
  auditLogExport: {
    SOFTWARE_SUPER_ADMIN: 'AUTHORIZED',
    CLIENT_ADMIN: 'AUTHORIZED',
    'ITAM Admin': 'READ_ONLY',
    'CMDB Admin': 'READ_ONLY',
    Security: 'AUTHORIZED',
    Finance: 'READ_ONLY',
    Employee: 'DENIED',
  },
  apiTokenManagement: {
    SOFTWARE_SUPER_ADMIN: 'AUTHORIZED',
    CLIENT_ADMIN: 'AUTHORIZED',
    'ITAM Admin': 'DENIED',
    'CMDB Admin': 'AUTHORIZED',
    Security: 'READ_ONLY',
    Finance: 'DENIED',
    Employee: 'DENIED',
  },
};

const tenantRbacMatrices = new Map<string, RbacMatrixState>();

export function getRbacMatrixForTenant(tenantId: string = 'tenant-client-1'): RbacMatrixState {
  if (!tenantRbacMatrices.has(tenantId)) {
    const initialState: RbacMatrixState = {
      tenantId,
      capabilities: JSON.parse(JSON.stringify(DEFAULT_RBAC_CAPABILITIES)),
      matrix: JSON.parse(JSON.stringify(DEFAULT_RBAC_MATRIX)),
      lastUpdated: new Date().toISOString(),
      updatedBy: 'System Default Configuration',
    };
    tenantRbacMatrices.set(tenantId, initialState);
  }
  return tenantRbacMatrices.get(tenantId)!;
}

export function saveRbacMatrixForTenant(
  tenantId: string,
  matrix: RbacMatrixPermissions,
  capabilities?: RbacCapabilityItem[],
  updatedBy?: string
): { success: boolean; data?: RbacMatrixState; error?: string } {
  try {
    const existing = getRbacMatrixForTenant(tenantId);
    const updated: RbacMatrixState = {
      tenantId,
      capabilities: capabilities || existing.capabilities,
      matrix,
      lastUpdated: new Date().toISOString(),
      updatedBy: updatedBy || 'Client Administrator',
    };
    tenantRbacMatrices.set(tenantId, updated);
    return { success: true, data: updated };
  } catch (err: any) {
    return { success: false, error: 'Failed to persist RBAC matrix state.' };
  }
}

export function resetRbacMatrixForTenant(tenantId: string): { success: boolean; data: RbacMatrixState } {
  const resetState: RbacMatrixState = {
    tenantId,
    capabilities: JSON.parse(JSON.stringify(DEFAULT_RBAC_CAPABILITIES)),
    matrix: JSON.parse(JSON.stringify(DEFAULT_RBAC_MATRIX)),
    lastUpdated: new Date().toISOString(),
    updatedBy: 'System Policy Reset',
  };
  tenantRbacMatrices.set(tenantId, resetState);
  return { success: true, data: resetState };
}
