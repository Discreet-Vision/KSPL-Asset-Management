export type SoftwareType = 
  | 'Application' 
  | 'Operating System' 
  | 'SaaS' 
  | 'Database' 
  | 'Middleware' 
  | 'Driver' 
  | 'Runtime' 
  | 'Development Tool' 
  | 'Security Software' 
  | 'Utility';

export type SoftwareCategory = 
  | 'Productivity' 
  | 'Security' 
  | 'Database' 
  | 'Operating System' 
  | 'Development' 
  | 'Infrastructure' 
  | 'Monitoring' 
  | 'Virtualization' 
  | 'Cloud' 
  | 'SaaS' 
  | 'Utility' 
  | 'Other';

export type SoftwareLifecycleStatus = 
  | 'Active' 
  | 'Supported' 
  | 'End of Support' 
  | 'End of Life' 
  | 'Deprecated' 
  | 'Unknown';

export type NormalizationStatus = 
  | 'Normalized' 
  | 'Unnormalized' 
  | 'Possible Match' 
  | 'Needs Review' 
  | 'Rejected' 
  | 'Verified' 
  | 'Deprecated';

export interface PublisherCatalogEntry {
  id: string;
  canonicalName: string;
  aliases: string[];
  website?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CanonicalSoftwareProduct {
  id: string;
  publisherId: string;
  publisherName: string;
  productName: string;
  productFamily?: string;
  edition?: string;
  majorVersion?: string;
  minorVersion?: string;
  architecture?: '364-bit' | '32-bit' | 'x86' | 'x64' | 'ARM' | 'Universal';
  softwareType: SoftwareType;
  category: SoftwareCategory;
  lifecycleStatus: SoftwareLifecycleStatus;
  identifiers?: {
    cpe?: string;
    swidTag?: string;
    partNumber?: string;
    spdxId?: string;
  };
  variants: string[]; // Raw strings that map to this product
  tenantId?: string; // Optional tenant-specific extension
  createdAt: string;
  updatedAt: string;
}

export interface SoftwareAliasMapping {
  id: string;
  rawPattern: string;
  canonicalPublisher: string;
  canonicalProduct: string;
  canonicalEdition?: string;
  tenantId?: string;
  createdBy: string;
  createdAt: string;
}

export interface SoftwareNormalizationResult {
  rawDiscoveredString: string;
  cleanedNormalizedString: string;
  canonicalProductId?: string;
  matchedPublisher?: string;
  matchedProduct?: string;
  matchedEdition?: string;
  extractedVersion?: string;
  extractedArchitecture?: string;
  confidenceScore: number; // 0 - 100
  normalizationStatus: NormalizationStatus;
  matchingMethod: 'Exact Identifier' | 'Exact Name' | 'Alias Match' | 'Fuzzy Match' | 'Manual Review' | 'Unmatched';
  explanation: string[];
  normalizedAt: string;
  tenantId: string;
}

export interface NormalizationCatalogBatchReport {
  totalRecordsProcessed: number;
  normalizedCount: number;
  needsReviewCount: number;
  unnormalizedCount: number;
  averageConfidencePct: number;
  processedAt: string;
}
