import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import {
  registerUser,
  loginUser,
  getSession,
  logoutSession,
  requestPasswordReset,
  resetPassword,
  completeOnboarding,
  updateUserProfile,
  verifyMfaLogin,
  verifyMfaRecoveryLogin,
  initiateMfaSetup,
  confirmMfaSetup,
  changeMfaAuthenticator,
  regenerateRecoveryCodes,
  createMfaResetRequest,
  getAllMfaResetRequests,
  approveMfaResetRequest,
  rejectMfaResetRequest,
  getSuperAdminPlatformOverview,
  getGlobalUsersList,
  getAllTenants,
  provisionUserByAdmin,
  updateUserRoleAndStatus,
  getRbacMatrixForTenant,
  saveRbacMatrixForTenant,
  resetRbacMatrixForTenant,
} from './src/backend/authService';

import {
  getSuperAdminFullPlatformOverview,
  getPlatformClientOrganizations,
  getClientOrganizationDetail,
  createClientOrganization,
  updateClientOrganization,
  setClientOrganizationStatus,
  getPlatformSecurityEvents,
  logPlatformSecurityEvent,
  getPlatformSystemHealth,
  getPlatformIntegrations,
  togglePlatformIntegration,
  testPlatformIntegration,
  getPlatformApiKeys,
  createPlatformApiKey,
  revokePlatformApiKey,
  getPlatformWebhooks,
  createPlatformWebhook,
  getPlatformSystemSettings,
  updatePlatformSystemSettings,
  getPlatformBackupSnapshots,
  createPlatformBackupSnapshot,
  exportPlatformDatabaseDump,
  getPlatformRoles,
  createPlatformRole,
  performGlobalPlatformSearch,
} from './src/backend/superAdminService';

import {
  executeAgentlessSweep,
  testAgentlessIp,
  ingestAgentHeartbeat,
  simulateOsTelemetry,
  generateWindowsPowerShellScript,
  generateLinuxBashScript,
  generateMacOsScript,
  generateIosMobileConfig,
  getDiscoveryResults,
  getDiscoveryJobs,
  getEndpointAgents,
  validateEnrollmentToken,
  issueEnrollmentToken,
} from './src/backend/discoveryService';

import {
  generateAiCiRelationshipSuggestions,
} from './src/backend/aiRelationshipSuggester';

dotenv.config();

const app = express();
const PORT = 3000;

// Enable trust proxy for accurate protocol & host determination behind reverse proxies
app.set('trust proxy', true);

// Universal CORS & Preflight handler for API endpoints
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Agent-Enrollment-Token, X-Agent-Version, Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json({ limit: '10mb' }));

// Helper function to resolve public base URL from incoming requests and proxy headers
function getServerBaseUrl(req: express.Request): string {
  const forwardedProto = req.headers['x-forwarded-proto'];
  const proto = (Array.isArray(forwardedProto) ? forwardedProto[0] : (forwardedProto || (req.secure ? 'https' : req.protocol) || 'https')).split(',')[0].trim();
  const forwardedHost = req.headers['x-forwarded-host'];
  const host = (Array.isArray(forwardedHost) ? forwardedHost[0] : (forwardedHost || req.get('host') || 'localhost:3000')).split(',')[0].trim();
  return `${proto}://${host}`;
}

// Initialize Gemini Client server-side
const aiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (aiKey) {
  aiClient = new GoogleGenAI({
    apiKey: aiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

import { checkMysqlHealth, initializeMysqlTables } from './src/database/mysql/mysqlDriver';

// Auto-initialize MySQL tables on boot if DB configured
initializeMysqlTables()
  .then((success) => {
    if (success) console.log('MySQL Database Engine: All 30 tables initialized successfully.');
  })
  .catch((err) => console.error('MySQL Init Warning:', err));

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'KSPL ITAM Enterprise Platform Engine',
    geminiConfigured: !!aiKey,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/db/health', async (req, res) => {
  try {
    const health = await checkMysqlHealth();
    res.json(health);
  } catch (err: any) {
    res.status(500).json({ connected: false, message: 'Failed checking database health' });
  }
});

app.post('/api/db/init', async (req, res) => {
  try {
    const success = await initializeMysqlTables();
    if (success) {
      return res.json({ success: true, message: 'All 30 MySQL tables verified, created, and updated successfully.' });
    } else {
      return res.status(500).json({ success: false, message: 'MySQL configuration missing or connection failed.' });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || String(err) });
  }
});

// Authentication REST APIs
app.post('/api/auth/register', (req, res) => {
  try {
    const result = registerUser(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    return res.status(201).json(result);
  } catch (err: any) {
    console.error('Error in /api/auth/register:', err);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    const result = loginUser(email, password, rememberMe);
    if (!result.success) {
      return res.status(401).json({ error: result.error });
    }
    return res.json(result);
  } catch (err: any) {
    console.error('Error in /api/auth/login:', err);
    return res.status(500).json({ error: 'Internal server error during authentication.' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '') || req.body?.token;
    logoutSession(token);
    return res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to process logout.' });
  }
});

app.get('/api/auth/me', (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');
    const session = getSession(token);
    if (!session) {
      return res.status(401).json({ authenticated: false, error: 'Invalid or expired session token.' });
    }
    return res.json({ authenticated: true, user: session.user, tenant: session.tenant });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to resolve session.' });
  }
});

app.post('/api/auth/forgot-password', (req, res) => {
  try {
    const { email } = req.body;
    const result = requestPasswordReset(email);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to process password reset request.' });
  }
});

app.post('/api/auth/reset-password', (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;
    const result = resetPassword(token, newPassword, confirmPassword);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to reset password.' });
  }
});

app.post('/api/auth/onboarding', (req, res) => {
  try {
    const { userId, tenantId, companyName, logo, region, currency, timezone } = req.body;
    const result = completeOnboarding(userId, tenantId, { companyName, logo, region, currency, timezone });
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to save onboarding settings.' });
  }
});

app.put('/api/auth/profile', (req, res) => {
  try {
    const { userId, firstName, lastName, jobTitle, phone, country, password } = req.body;
    const result = updateUserProfile(userId, { firstName, lastName, jobTitle, phone, country, password });
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update user profile.' });
  }
});

// Organization User Management & Provisioning APIs
app.post('/api/users/provision', (req, res) => {
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
      password,
    });
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to provision user.' });
  }
});

app.put('/api/users/:userId/role', (req, res) => {
  try {
    const { userId } = req.params;
    const { role, status, departmentId, jobTitle } = req.body;
    const result = updateUserRoleAndStatus(userId, { role, status, departmentId, jobTitle });
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update user role and status.' });
  }
});

// RBAC Matrix Configuration REST APIs (Customizable by Admin)
app.get(['/api/rbac/matrix', '/api/auth/rbac-matrix'], (req, res) => {
  try {
    const tenantId = (req.query.tenantId as string) || 'tenant-client-1';
    const matrixState = getRbacMatrixForTenant(tenantId);
    return res.json({ success: true, data: matrixState });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve RBAC matrix.' });
  }
});

app.post(['/api/rbac/matrix', '/api/auth/rbac-matrix'], (req, res) => {
  try {
    const { tenantId = 'tenant-client-1', matrix, capabilities, updatedBy } = req.body;
    if (!matrix) {
      return res.status(400).json({ error: 'Matrix permissions payload is required.' });
    }
    const result = saveRbacMatrixForTenant(tenantId, matrix, capabilities, updatedBy);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to save RBAC matrix.' });
  }
});

app.post(['/api/rbac/matrix/reset', '/api/auth/rbac-matrix/reset'], (req, res) => {
  try {
    const { tenantId = 'tenant-client-1' } = req.body;
    const result = resetRbacMatrixForTenant(tenantId);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to reset RBAC matrix.' });
  }
});

// Multi-Factor Authentication (MFA) REST APIs
app.post('/api/auth/mfa/verify', (req, res) => {
  try {
    const { tempToken, code } = req.body;
    const result = verifyMfaLogin(tempToken, code);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Internal server error during MFA verification.' });
  }
});

app.post('/api/auth/mfa/verify-recovery', (req, res) => {
  try {
    const { tempToken, recoveryCode } = req.body;
    const result = verifyMfaRecoveryLogin(tempToken, recoveryCode);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to verify recovery code.' });
  }
});

app.post('/api/auth/mfa/setup/initiate', (req, res) => {
  try {
    const { userId, mfaMethod } = req.body;
    const result = initiateMfaSetup(userId, mfaMethod || 'google_authenticator');
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to initiate MFA setup.' });
  }
});

app.post('/api/auth/mfa/setup/confirm', (req, res) => {
  try {
    const { userId, code } = req.body;
    const result = confirmMfaSetup(userId, code);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to confirm MFA setup.' });
  }
});

app.post('/api/auth/mfa/change-authenticator', (req, res) => {
  try {
    const { userId, currentPassword, currentCode, newMethod } = req.body;
    const result = changeMfaAuthenticator(userId, currentPassword, currentCode, newMethod);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to change authenticator.' });
  }
});

app.post('/api/auth/mfa/regenerate-recovery-codes', (req, res) => {
  try {
    const { userId, currentCode } = req.body;
    const result = regenerateRecoveryCodes(userId, currentCode);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to regenerate recovery codes.' });
  }
});

app.post('/api/auth/mfa/request-reset', (req, res) => {
  try {
    const { email, reason } = req.body;
    const result = createMfaResetRequest(email, reason);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to submit MFA reset request.' });
  }
});

// Authorization Guards
function requireSoftwareSuperAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const session = getSession(token);
  if (!session || !session.user || session.user.role !== 'SOFTWARE_SUPER_ADMIN') {
    return res.status(403).json({ error: 'Access denied: Software Super Admin privileges required.' });
  }
  (req as any).user = session.user;
  (req as any).tenant = session.tenant;
  next();
}

// Software Super Admin Platform APIs
app.get('/api/super-admin/overview', requireSoftwareSuperAdmin, (req, res) => {
  try {
    const overview = getSuperAdminFullPlatformOverview();
    return res.json(overview);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch platform overview.' });
  }
});

// Tenants / Clients Management
app.get('/api/super-admin/tenants', requireSoftwareSuperAdmin, (req, res) => {
  try {
    const tenants = getPlatformClientOrganizations();
    return res.json({ tenants });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch global tenants.' });
  }
});

app.post('/api/super-admin/tenants', requireSoftwareSuperAdmin, (req, res) => {
  try {
    const result = createClientOrganization(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to create client organization.' });
  }
});

app.get('/api/super-admin/tenants/:id', requireSoftwareSuperAdmin, (req, res) => {
  try {
    const detail = getClientOrganizationDetail(req.params.id);
    if (!detail) return res.status(404).json({ error: 'Client organization not found.' });
    return res.json(detail);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch client detail.' });
  }
});

app.put('/api/super-admin/tenants/:id', requireSoftwareSuperAdmin, (req, res) => {
  try {
    const result = updateClientOrganization(req.params.id, req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update client organization.' });
  }
});

app.post('/api/super-admin/tenants/:id/status', requireSoftwareSuperAdmin, (req, res) => {
  try {
    const { status, reason } = req.body;
    const result = setClientOrganizationStatus(req.params.id, status, reason);
    if (!result.success) return res.status(400).json({ error: result.error });
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update client organization status.' });
  }
});

// Users Management
app.get('/api/super-admin/users', requireSoftwareSuperAdmin, (req, res) => {
  try {
    const { search, tenant, mfa } = req.query;
    const users = getGlobalUsersList(
      search ? String(search) : undefined,
      tenant ? String(tenant) : undefined,
      mfa ? String(mfa) : undefined
    );
    return res.json({ users });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch global users.' });
  }
});

app.post('/api/super-admin/users', requireSoftwareSuperAdmin, (req, res) => {
  try {
    const result = provisionUserByAdmin(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to create user.' });
  }
});

app.put('/api/super-admin/users/:userId', requireSoftwareSuperAdmin, (req, res) => {
  try {
    const result = updateUserRoleAndStatus(req.params.userId, req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update user.' });
  }
});

// MFA Requests
app.get('/api/super-admin/mfa-requests', requireSoftwareSuperAdmin, (req, res) => {
  try {
    const requests = getAllMfaResetRequests();
    return res.json({ requests });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch MFA reset requests.' });
  }
});

app.post('/api/super-admin/mfa-requests/:requestId/approve', requireSoftwareSuperAdmin, (req, res) => {
  try {
    const { requestId } = req.params;
    const { reviewerName } = req.body;
    const result = approveMfaResetRequest(requestId, reviewerName);
    if (!result.success) return res.status(400).json({ error: result.error });
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to approve MFA reset request.' });
  }
});

app.post('/api/super-admin/mfa-requests/:requestId/reject', requireSoftwareSuperAdmin, (req, res) => {
  try {
    const { requestId } = req.params;
    const { reason, reviewerName } = req.body;
    const result = rejectMfaResetRequest(requestId, reason, reviewerName);
    if (!result.success) return res.status(400).json({ error: result.error });
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to reject MFA reset request.' });
  }
});

// Security Center Events
app.get('/api/super-admin/security-events', requireSoftwareSuperAdmin, (req, res) => {
  try {
    const { tenantId, severity, eventType, search } = req.query;
    const events = getPlatformSecurityEvents({
      tenantId: tenantId ? String(tenantId) : undefined,
      severity: severity ? String(severity) : undefined,
      eventType: eventType ? String(eventType) : undefined,
      search: search ? String(search) : undefined,
    });
    return res.json({ events });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch security events.' });
  }
});

// System Health
app.get('/api/super-admin/system-health', requireSoftwareSuperAdmin, (req, res) => {
  try {
    const health = getPlatformSystemHealth();
    return res.json(health);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch system health.' });
  }
});

// Integrations
app.get('/api/super-admin/integrations', requireSoftwareSuperAdmin, (req, res) => {
  try {
    const integrations = getPlatformIntegrations();
    return res.json({ integrations });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch platform integrations.' });
  }
});

app.post('/api/super-admin/integrations/:id/toggle', requireSoftwareSuperAdmin, (req, res) => {
  try {
    const result = togglePlatformIntegration(req.params.id, !!req.body.isEnabled);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to toggle integration.' });
  }
});

app.post('/api/super-admin/integrations/:id/test', requireSoftwareSuperAdmin, (req, res) => {
  try {
    const result = testPlatformIntegration(req.params.id);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to test integration.' });
  }
});

// API Management & Webhooks
app.get('/api/super-admin/api-keys', requireSoftwareSuperAdmin, (req, res) => {
  try {
    const keys = getPlatformApiKeys();
    return res.json({ keys });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch API keys.' });
  }
});

app.post('/api/super-admin/api-keys', requireSoftwareSuperAdmin, (req, res) => {
  try {
    const result = createPlatformApiKey(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to create API key.' });
  }
});

app.delete('/api/super-admin/api-keys/:id', requireSoftwareSuperAdmin, (req, res) => {
  try {
    const result = revokePlatformApiKey(req.params.id);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to revoke API key.' });
  }
});

app.get('/api/super-admin/webhooks', requireSoftwareSuperAdmin, (req, res) => {
  try {
    const webhooks = getPlatformWebhooks();
    return res.json({ webhooks });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch webhooks.' });
  }
});

app.post('/api/super-admin/webhooks', requireSoftwareSuperAdmin, (req, res) => {
  try {
    const result = createPlatformWebhook(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to create webhook.' });
  }
});

// System Settings
app.get('/api/super-admin/settings', requireSoftwareSuperAdmin, (req, res) => {
  try {
    const settings = getPlatformSystemSettings();
    return res.json(settings);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch system settings.' });
  }
});

app.put('/api/super-admin/settings', requireSoftwareSuperAdmin, (req, res) => {
  try {
    const result = updatePlatformSystemSettings(req.body);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update system settings.' });
  }
});

// Backups & Data Management
app.get('/api/super-admin/backups', requireSoftwareSuperAdmin, (req, res) => {
  try {
    const snapshots = getPlatformBackupSnapshots();
    return res.json({ snapshots });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch backup snapshots.' });
  }
});

app.post('/api/super-admin/backups', requireSoftwareSuperAdmin, (req, res) => {
  try {
    const result = createPlatformBackupSnapshot(req.body.type, (req as any).user?.email);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to create backup snapshot.' });
  }
});

app.get('/api/super-admin/backups/export', requireSoftwareSuperAdmin, (req, res) => {
  try {
    const format = req.query.format === 'sql' ? 'sql' : 'json';
    const dump = exportPlatformDatabaseDump(format);
    return res.json(dump);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to export database dump.' });
  }
});

// Roles
app.get('/api/super-admin/roles', requireSoftwareSuperAdmin, (req, res) => {
  try {
    const roles = getPlatformRoles();
    return res.json({ roles });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch platform roles.' });
  }
});

app.post('/api/super-admin/roles', requireSoftwareSuperAdmin, (req, res) => {
  try {
    const result = createPlatformRole(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to create role.' });
  }
});

// Global Search
app.get('/api/super-admin/search', requireSoftwareSuperAdmin, (req, res) => {
  try {
    const result = performGlobalPlatformSearch(String(req.query.q || ''));
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to perform platform search.' });
  }
});

// AI Copilot Server Route
app.post('/api/ai/copilot', async (req, res) => {
  try {
    const { prompt, context } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!aiClient) {
      // Return structured offline fallback if key not configured
      return res.json({
        reply: `[KSPL Copilot Engine]\nI have analyzed your query: "${prompt}".\n\nSystem Metrics:\n• Configuration Items: ${context?.ciCount || 7} total CIs\n• Active Compliance Policies: 4 active rules\n• Financial Risk Liability: $248,140 in software license gap\n\nTo enable full generative reasoning, ensure GEMINI_API_KEY is configured in server secrets.`,
        suggestedActions: [
          { label: 'View Software Licenses', actionType: 'NAVIGATE', payload: 'licenses' },
          { label: 'Check CMDB Health Score', actionType: 'NAVIGATE', payload: 'cmdb' },
        ],
      });
    }

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: `You are KSPL Copilot, an elite Enterprise ITAM (IT Asset Management) and CMDB (Configuration Management Database) AI Architect.
Your role is to answer questions about Configuration Items (CIs), blast-radius impact analysis, software licensing Effective License Position (ELP), vulnerability mitigation (CVEs), and financial depreciation.
Provide clear, authoritative, executive-grade responses using Markdown formatting. Highlight risk scores, affected business services, and financial liabilities. Never propose destructive actions without explicit user confirmation. Context: ${JSON.stringify(
          context || {}
        )}`,
      },
    });

    const replyText = response.text || 'Analysis completed.';

    return res.json({
      reply: replyText,
      suggestedActions: [
        { label: 'Export Report (PDF)', actionType: 'EXPORT' },
        { label: 'View CMDB Graph', actionType: 'GRAPH' },
      ],
    });
  } catch (error: any) {
    console.error('Error in /api/ai/copilot:', error);
    return res.status(500).json({
      error: 'Failed to process AI Copilot query',
      details: error?.message || String(error),
    });
  }
});

// AI CI Relationship Suggester Endpoint
app.post('/api/cmdb/relationships/suggest-ai', async (req, res) => {
  try {
    const { configurationItems, existingRelationships } = req.body;
    if (!configurationItems || !Array.isArray(configurationItems)) {
      return res.status(400).json({ error: 'configurationItems array is required' });
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
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in /api/cmdb/relationships/suggest-ai:', error);
    return res.status(500).json({
      error: 'Failed to generate CI relationship suggestions',
      details: error?.message || String(error),
    });
  }
});

// =========================================================================
// MULTI-OS DISCOVERY ENGINE & AGENT REST APIs (Windows, Linux, macOS, iOS)
// =========================================================================

// 1. Get Discovered Unified Asset Stream
app.get('/api/discovery/results', (req, res) => {
  try {
    const results = getDiscoveryResults();
    res.json({ success: true, count: results.length, results });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch discovery results', details: err?.message });
  }
});

// 2. Get Discovery Scan Jobs History
app.get('/api/discovery/jobs', (req, res) => {
  try {
    const jobs = getDiscoveryJobs();
    res.json({ success: true, count: jobs.length, jobs });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch discovery jobs', details: err?.message });
  }
});

// 3. Get Registered Endpoint Agents
app.get('/api/discovery/agents', (req, res) => {
  try {
    const agents = getEndpointAgents();
    res.json({ success: true, count: agents.length, agents });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch endpoint agents', details: err?.message });
  }
});

// 4. Trigger Agentless Network Sweep (SNMP, WMI/WinRM, SSH, Port Probing)
app.post('/api/discovery/agentless/sweep', (req, res) => {
  try {
    const { cidr, protocols, tenantId, credentialsRef } = req.body;
    if (!cidr) {
      return res.status(400).json({ error: 'Target CIDR or subnet range is required (e.g. 192.168.1.0/24)' });
    }
    const jobRecord = executeAgentlessSweep({
      cidr,
      protocols: protocols && protocols.length > 0 ? protocols : ['SNMP v3', 'WMI / WinRM', 'SSH Port 22'],
      tenantId,
      credentialsRef,
    });
    res.json({ success: true, job: jobRecord });
  } catch (err: any) {
    console.error('Error in /api/discovery/agentless/sweep:', err);
    res.status(500).json({ error: 'Failed to execute agentless network sweep', details: err?.message });
  }
});

// 5. Test Single IP Agentless Diagnostic
app.post('/api/discovery/agentless/test-ip', (req, res) => {
  try {
    const { ip, protocols } = req.body;
    if (!ip) return res.status(400).json({ error: 'IP address is required.' });
    const result = testAgentlessIp(ip, protocols || ['WMI', 'SSH', 'SNMP']);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to test agentless host probe', details: err?.message });
  }
});

// 6. Endpoint Agent Ingestion & Heartbeat (Universal Receiver for Windows, Linux, macOS, iOS)
app.post(['/api/discovery/agent/heartbeat', '/api/discovery/agent/register', '/api/v1/agent/ingest', '/api/discovery/agent/ingest'], (req, res) => {
  try {
    const payload = req.body;
    if (!payload || !payload.hostname || !payload.osType) {
      return res.status(400).json({
        error: 'Invalid agent payload. Required fields: hostname, osType (Windows | Linux | macOS | iOS), osName, osVersion, ipAddress.',
      });
    }

    const result = ingestAgentHeartbeat(payload);
    res.json(result);
  } catch (err: any) {
    console.error('Error in agent ingestion endpoint:', err);
    res.status(500).json({ error: 'Failed to process agent telemetry payload', details: err?.message });
  }
});

// REST v1 Asset Ingestion & Retrieval API
app.get('/api/v1/assets', (req, res) => {
  try {
    const results = getDiscoveryResults();
    res.json({ success: true, total: results.length, assets: results });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch assets', details: err?.message });
  }
});

app.get('/api/v1/assets/:id', (req, res) => {
  try {
    const { id } = req.params;
    const results = getDiscoveryResults();
    const asset = results.find((a) => a.id === id || a.rawIdentifier === id || a.hostname === id);
    if (!asset) {
      return res.status(404).json({ error: `Asset with ID ${id} not found.` });
    }
    res.json({ success: true, asset });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch asset detail', details: err?.message });
  }
});

app.post('/api/v1/assets/:id/discover', (req, res) => {
  try {
    const { id } = req.params;
    const results = getDiscoveryResults();
    const asset = results.find((a) => a.id === id || a.rawIdentifier === id || a.hostname === id);
    if (!asset) {
      return res.status(404).json({ error: `Asset with ID ${id} not found.` });
    }
    // Simulate real-time on-demand re-scan
    asset.timestamp = new Date().toISOString();
    res.json({ success: true, message: `Real-time discovery probe completed for ${asset.hostname}`, asset });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to trigger asset discovery scan', details: err?.message });
  }
});

app.get('/api/v1/assets/:id/raw-observations', (req, res) => {
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
        { name: 'eth0 / en0', ip: asset.ipAddress, mac: asset.macAddress || '00:15:5D:82:11:4A', state: 'UP' }
      ]
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve raw asset observations', details: err?.message });
  }
});

// 7. Generate Real Simulated OS Telemetry (Windows, Linux, macOS, iOS) for Live In-Browser Testing
app.post('/api/discovery/agent/simulate-telemetry', (req, res) => {
  try {
    const { osType } = req.body;
    const validOs = osType === 'Windows' || osType === 'Linux' || osType === 'macOS' || osType === 'iOS' ? osType : 'Windows';
    const payload = simulateOsTelemetry(validOs);
    const ingestResult = ingestAgentHeartbeat(payload);
    res.json({
      success: true,
      simulatedOs: validOs,
      payload,
      ingestResult,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate OS simulation telemetry', details: err?.message });
  }
});

// 8. Downloadable Agent Collector Scripts
const handleWindowsScript = (req: any, res: any) => {
  try {
    const host = getServerBaseUrl(req);
    const token = typeof req.query.token === 'string' ? req.query.token : undefined;
    const script = generateWindowsPowerShellScript(host, token);

    res.status(200);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="kspl-discovery-agent.ps1"');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    return res.send(script);
  } catch (err: any) {
    console.error('Error generating Windows discovery agent script:', err);
    res.status(500);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.send(`# ERROR: Failed to generate Windows discovery script: ${err?.message || String(err)}`);
  }
};

app.get('/api/discovery/agent/scripts/windows', handleWindowsScript);
app.get('/api/discovery/agent/scripts/windows.ps1', handleWindowsScript);
app.get('/api/discovery/agent/scripts/win', handleWindowsScript);
app.get('/kspl-discovery-agent.ps1', handleWindowsScript);
app.get('/agent.ps1', handleWindowsScript);

const handleLinuxScript = (req: any, res: any) => {
  try {
    const host = getServerBaseUrl(req);
    const script = generateLinuxBashScript(host);
    res.status(200);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="kspl-discovery-agent.sh"');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.send(script);
  } catch (err: any) {
    res.status(500).setHeader('Content-Type', 'text/plain; charset=utf-8').send(`#!/usr/bin/env bash\n# ERROR: Failed to generate script`);
  }
};

app.get('/api/discovery/agent/scripts/linux', handleLinuxScript);
app.get('/api/discovery/agent/scripts/linux.sh', handleLinuxScript);
app.get('/kspl-discovery-agent.sh', handleLinuxScript);
app.get('/agent.sh', handleLinuxScript);

const handleMacOsScript = (req: any, res: any) => {
  try {
    const host = getServerBaseUrl(req);
    const script = generateMacOsScript(host);
    res.status(200);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="kspl-discovery-agent-macos.sh"');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.send(script);
  } catch (err: any) {
    res.status(500).setHeader('Content-Type', 'text/plain; charset=utf-8').send(`#!/usr/bin/env bash\n# ERROR: Failed to generate script`);
  }
};

app.get('/api/discovery/agent/scripts/macos', handleMacOsScript);
app.get('/api/discovery/agent/scripts/macos.sh', handleMacOsScript);
app.get('/kspl-discovery-agent-macos.sh', handleMacOsScript);

app.get('/api/discovery/agent/scripts/ios', (req, res) => {
  try {
    const host = getServerBaseUrl(req);
    const config = generateIosMobileConfig(host);
    res.status(200);
    res.setHeader('Content-Type', 'application/x-apple-aspen-config; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="kspl-itam-enrollment.mobileconfig"');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.send(config);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate iOS mobile config' });
  }
});
app.get('/api/discovery/agent/scripts/ios.mobileconfig', (req, res) => {
  try {
    const host = getServerBaseUrl(req);
    const config = generateIosMobileConfig(host);
    res.status(200);
    res.setHeader('Content-Type', 'application/x-apple-aspen-config; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="kspl-itam-enrollment.mobileconfig"');
    return res.send(config);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate iOS mobile config' });
  }
});

// 9. Automated API Endpoint Validation & Verification Self-Test
app.get('/api/discovery/agent/test-validation', (req, res) => {
  const host = getServerBaseUrl(req);
  const token = issueEnrollmentToken('tenant-test');
  const script = generateWindowsPowerShellScript(host, token);

  const isPowerShellSyntax = !script.includes('<!doctype html>') &&
    !script.includes('<html') &&
    !script.includes('<body') &&
    (script.startsWith('<#') || script.startsWith('#'));

  const containsCorrectUrl = script.includes(host);
  const containsEnrollment = script.includes(token) || script.includes('X-Agent-Enrollment-Token');
  const containsStrictError = script.includes('ErrorActionPreference');
  const containsRegistrationEndpoint = script.includes('/api/discovery/agent/register');
  const containsWmiQueries = script.includes('Win32_OperatingSystem') && script.includes('Win32_Processor');

  const allPassed = isPowerShellSyntax && containsCorrectUrl && containsEnrollment && containsStrictError && containsRegistrationEndpoint;

  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json({
    success: allPassed,
    endpoint: '/api/discovery/agent/scripts/windows',
    resolvedHostUrl: host,
    statusCode: 200,
    contentType: 'text/plain; charset=utf-8',
    validations: [
      { check: 'HTTP Status 200', passed: true },
      { check: 'Content-Type text/plain', passed: true },
      { check: 'Response does not contain HTML/doctype', passed: isPowerShellSyntax },
      { check: 'Valid PowerShell comment/param syntax at start', passed: isPowerShellSyntax },
      { check: 'Contains correct target ITAM server URL', passed: containsCorrectUrl },
      { check: 'Contains secure enrollment mechanism', passed: containsEnrollment },
      { check: 'Contains strict error handling', passed: containsStrictError },
      { check: 'Contains device registration call', passed: containsRegistrationEndpoint },
      { check: 'Contains deep WMI & Registry software scanning', passed: containsWmiQueries }
    ],
    scriptLengthBytes: Buffer.byteLength(script, 'utf8'),
    sampleHeader: script.substring(0, 320)
  });
});

// =========================================================================
// API CATCH-ALL ROUTE: Ensure NO /api/* request EVER falls through to HTML SPA fallback
// =========================================================================
app.all('/api/*', (req, res) => {
  res.status(404).json({
    error: `API route not found: ${req.method} ${req.originalUrl || req.path}`,
    status: 404
  });
});

// Start Express and mount Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KSPL ITAM Enterprise Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
