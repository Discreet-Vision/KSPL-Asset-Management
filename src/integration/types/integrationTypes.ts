// ==================== INTEGRATION FABRIC TYPES ====================

export interface ApiEndpointContract {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  version: 'v1';
  description: string;
  category: 'Assets' | 'CIs' | 'Users' | 'Services' | 'Contracts' | 'Vendors' | 'Events';
  rateLimitPerMin: number;
}

export interface ApiResponsePayload<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'RATE_LIMITED' | 'INTERNAL_ERROR';
    message: string;
  };
  pagination?: {
    page: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
  };
  correlationId: string;
  timestamp: string;
}

export interface WebhookSubscription {
  id: string;
  subscriberName: string;
  targetUrl: string;
  secretMasked: string;
  subscribedEvents: string[];
  isActive: boolean;
  signatureAlgorithm: 'HMAC-SHA256';
  retryCountMax: number;
  lastTriggeredAt: string;
  tenantId: string;
}

export interface WebhookEventDelivery {
  id: string;
  webhookId: string;
  eventId: string;
  eventType: string;
  correlationId: string;
  timestamp: string;
  signature: string;
  attemptNumber: number;
  status: 'Delivered' | 'Failed' | 'In Dead Letter Queue' | 'Retrying';
  responseCode?: number;
  errorMessage?: string;
  tenantId: string;
}

export interface EtlMappingRule {
  externalField: string;
  itamField: string;
  transformation: 'Direct Map' | 'Rename' | 'Date Format' | 'Uppercase' | 'Lowercase' | 'Value Lookup' | 'Combine Fields' | 'Default Value';
  defaultValue?: string;
}

export interface EtlConnectorConfig {
  id: string;
  connectorType: 'HRIS' | 'ERP' | 'ITSM' | 'Cloud Billing' | 'Procurement';
  name: string;
  sourceSystemName: string;
  status: 'Connected' | 'Disconnected' | 'Syncing' | 'Sync Failed' | 'Pending Setup';
  syncSchedule: 'Hourly' | 'Daily' | 'Weekly' | 'Real-Time Webhook';
  lastSyncAt: string;
  nextSyncAt: string;
  recordsProcessedCount: number;
  recordsFailedCount: number;
  mappings: EtlMappingRule[];
  tenantId: string;
}

export interface EtlErrorLogRecord {
  id: string;
  connectorId: string;
  sourceRecordId: string;
  rawPayloadSnippet: string;
  validationErrorMessage: string;
  failedAt: string;
  status: 'In Error Queue' | 'Resolved' | 'Discarded';
  tenantId: string;
}
