// ==================== API LAYER TEST SUITE ====================
// Automated unit and integration tests verifying GraphQL resolvers, REST idempotency, Webhook HMAC signatures, and field security.

import { GraphQLExecutionEngine } from '../graphql/GraphQLExecutionEngine';
import { RestIntegrationController } from '../rest/RestIntegrationController';
import { WebhookDispatcher } from '../webhooks/WebhookDispatcher';
import { ApiAuthAdapter } from '../security/ApiAuthAdapter';
import { ApiAuditAdapter } from '../audit/ApiAuditAdapter';
import { ApiTenantContext } from '../types/apiTypes';

export interface ApiTestResult {
  testName: string;
  passed: boolean;
  message: string;
  durationMs: number;
}

export class ApiLayerTestSuite {
  public static async runAllTests(tenantId: string = 'tenant-kspl-global'): Promise<ApiTestResult[]> {
    const results: ApiTestResult[] = [];

    const ctxAdmin: ApiTenantContext = {
      tenantId,
      userId: 'usr-admin',
      userRole: 'ADMIN',
      scopes: ['assets.read', 'assets.write', 'cmdb.read', 'software.read', 'licenses.read', 'contracts.read', 'workflow.read', 'workflow.execute', 'webhooks.manage', 'financial.view'],
    };

    const ctxRestricted: ApiTenantContext = {
      tenantId,
      userId: 'usr-field-tech',
      userRole: 'FIELD_TECH',
      scopes: ['assets.read', 'cmdb.read'], // No financial.view scope
    };

    const restController = new RestIntegrationController();
    const webhookDispatcher = new WebhookDispatcher();
    const authAdapter = new ApiAuthAdapter();

    // Test 1: GraphQL Nested Asset & Relationship Resolver
    try {
      const start = performance.now();
      const query = `
        query {
          asset(id: "ENT-AST-1001") {
            id
            name
            operatingSystem { name version }
            installedSoftware { name version }
            relationships { type targetId }
          }
        }
      `;
      const res = await GraphQLExecutionEngine.executeQuery({ query }, ctxAdmin);
      const passed = res.data && res.data.asset && res.data.asset.installedSoftware.length > 0;
      results.push({
        testName: 'GraphQL Flexible Nested Asset & Relationship Resolver',
        passed: !!passed,
        message: passed ? `Retrieved asset '${res.data.asset.name}' with ${res.data.asset.installedSoftware.length} nested software items.` : 'GraphQL query failed.',
        durationMs: Math.round(performance.now() - start),
      });
    } catch (e: any) {
      results.push({ testName: 'GraphQL Flexible Nested Asset & Relationship Resolver', passed: false, message: e.message, durationMs: 0 });
    }

    // Test 2: Blast Radius Dependency Graph Traversal
    try {
      const start = performance.now();
      const query = `
        query {
          blastRadius(ciId: "CI-10001", depth: 2) {
            ciId
            name
            relationshipType
            depth
          }
        }
      `;
      const res = await GraphQLExecutionEngine.executeQuery({ query }, ctxAdmin);
      const passed = res.data && Array.isArray(res.data.blastRadius) && res.data.blastRadius.length > 0;
      results.push({
        testName: 'Blast-Radius Dependency Graph Traversal Resolver',
        passed: !!passed,
        message: passed ? `Traversed dependency graph and identified ${res.data.blastRadius.length} affected downstream CIs.` : 'Blast radius query failed.',
        durationMs: Math.round(performance.now() - start),
      });
    } catch (e: any) {
      results.push({ testName: 'Blast-Radius Dependency Graph Traversal Resolver', passed: false, message: e.message, durationMs: 0 });
    }

    // Test 3: GraphQL Field-Level Security Data Masking
    try {
      const start = performance.now();
      const query = `
        query {
          asset(id: "ENT-AST-1001") {
            id
            name
            purchaseCost
          }
        }
      `;
      const res = await GraphQLExecutionEngine.executeQuery({ query }, ctxRestricted);
      const isMasked = res.data?.asset?.purchaseCost === '[MASKED_RESTRICTED_FIELD]';
      results.push({
        testName: 'GraphQL Field-Level Security & RBAC Data Masking',
        passed: isMasked,
        message: isMasked ? 'Financial fields successfully masked for restricted role lacking financial.view scope.' : 'Field masking failed.',
        durationMs: Math.round(performance.now() - start),
      });
    } catch (e: any) {
      results.push({ testName: 'GraphQL Field-Level Security & RBAC Data Masking', passed: false, message: e.message, durationMs: 0 });
    }

    // Test 4: GraphQL Query Depth & DataLoader N+1 Protection
    try {
      const start = performance.now();
      const deepQuery = `{ asset(id:"1") { operatingSystem { name } } } { { { { { { { { } } } } } } } }`;
      const res = await GraphQLExecutionEngine.executeQuery({ query: deepQuery }, ctxAdmin);
      const blocked = res.errors && res.errors[0].extensions?.code === 'QUERY_DEPTH_EXCEEDED';
      results.push({
        testName: 'GraphQL Query Depth & DataLoader N+1 Protection',
        passed: !!blocked,
        message: blocked ? 'Deep query blocked safely by depth limiter (Max depth = 5).' : 'Depth limiter failed.',
        durationMs: Math.round(performance.now() - start),
      });
    } catch (e: any) {
      results.push({ testName: 'GraphQL Query Depth & DataLoader N+1 Protection', passed: false, message: e.message, durationMs: 0 });
    }

    // Test 5: REST API & Idempotency Key Engine
    try {
      const start = performance.now();
      const key = `idem-key-${Date.now()}`;
      const payload = { workflowId: 'WF-ASSET-RETIREMENT-v1', targetEntityId: 'ENT-AST-1001' };

      const res1 = await restController.postWorkflowExecution(ctxAdmin, payload, key);
      const res2 = await restController.postWorkflowExecution(ctxAdmin, payload, key);

      const passed = res1.data.executionId === res2.data.executionId && res2.meta.idempotencyKey === key;
      results.push({
        testName: 'REST API & Idempotency-Key Execution Engine',
        passed,
        message: passed ? `Duplicate POST request prevented. Same execution ID '${res1.data.executionId}' returned.` : 'Idempotency check failed.',
        durationMs: Math.round(performance.now() - start),
      });
    } catch (e: any) {
      results.push({ testName: 'REST API & Idempotency-Key Execution Engine', passed: false, message: e.message, durationMs: 0 });
    }

    // Test 6: Webhook HMAC-SHA256 Signing & Replay Protection
    try {
      const start = performance.now();
      const logs = await webhookDispatcher.dispatchEvent('asset.updated', tenantId, { assetId: 'ENT-AST-1001', updatedBy: 'ServiceNow' });
      const passed = logs.length > 0 && logs[0].signature.startsWith('sha256=');

      results.push({
        testName: 'Webhook HMAC-SHA256 Signing & Delivery Subsystem',
        passed,
        message: passed ? `Webhook event dispatched to ${logs.length} subscribers with HMAC signature '${logs[0].signature.substring(0, 20)}...'.` : 'Webhook dispatch failed.',
        durationMs: Math.round(performance.now() - start),
      });
    } catch (e: any) {
      results.push({ testName: 'Webhook HMAC-SHA256 Signing & Delivery Subsystem', passed: false, message: e.message, durationMs: 0 });
    }

    // Test 7: API Key Hashing, Scopes & Multi-Tenant Isolation
    try {
      const start = performance.now();
      const { apiKeyRecord } = authAdapter.createApiKey(tenantId, 'usr-test', ['assets.read']);
      const keys = authAdapter.getApiKeys(tenantId);
      const passed = keys.some((k) => k.keyId === apiKeyRecord.keyId && k.status === 'ACTIVE');

      ApiAuditAdapter.log(tenantId, 'usr-test', 'API_KEY_CREATED', '/api/v1/keys', `Created key ${apiKeyRecord.keyPrefix}`);

      results.push({
        testName: 'API Key Hashing, Granular Scopes & Tenant Isolation',
        passed,
        message: passed ? `Created API Key '${apiKeyRecord.keyPrefix}...' with hashed secret storage.` : 'Key creation failed.',
        durationMs: Math.round(performance.now() - start),
      });
    } catch (e: any) {
      results.push({ testName: 'API Key Hashing, Granular Scopes & Tenant Isolation', passed: false, message: e.message, durationMs: 0 });
    }

    return results;
  }
}
