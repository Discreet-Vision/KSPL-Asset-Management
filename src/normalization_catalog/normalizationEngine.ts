import { 
  SoftwareType, 
  SoftwareCategory, 
  SoftwareLifecycleStatus, 
  NormalizationStatus, 
  PublisherCatalogEntry, 
  CanonicalSoftwareProduct, 
  SoftwareAliasMapping, 
  SoftwareNormalizationResult, 
  NormalizationCatalogBatchReport 
} from './types';

export class SoftwareNormalizationCatalogEngine {
  private publishers: Map<string, PublisherCatalogEntry> = new Map();
  private products: Map<string, CanonicalSoftwareProduct> = new Map();
  private aliasMappings: Map<string, SoftwareAliasMapping> = new Map();
  private learnedUserMappings: Map<string, { publisher: string; product: string; edition?: string }> = new Map();

  constructor() {
    this.seedDefaultPublishers();
    this.seedDefaultCanonicalProducts();
    this.seedDefaultAliases();
  }

  private seedDefaultPublishers() {
    const defaultPublishers: PublisherCatalogEntry[] = [
      {
        id: 'pub-msft',
        canonicalName: 'Microsoft',
        aliases: ['Microsoft Corporation', 'Microsoft Corp.', 'MS', 'MSFT', 'Microsoft Inc.'],
        website: 'https://www.microsoft.com',
        createdAt: '2026-08-11 00:00:00',
        updatedAt: '2026-08-11 00:00:00'
      },
      {
        id: 'pub-adobe',
        canonicalName: 'Adobe',
        aliases: ['Adobe Systems', 'Adobe Inc.', 'Adobe Systems Incorporated', 'ADBE'],
        website: 'https://www.adobe.com',
        createdAt: '2026-08-11 00:00:00',
        updatedAt: '2026-08-11 00:00:00'
      },
      {
        id: 'pub-oracle',
        canonicalName: 'Oracle',
        aliases: ['Oracle Corp', 'Oracle Corporation', 'ORCL'],
        website: 'https://www.oracle.com',
        createdAt: '2026-08-11 00:00:00',
        updatedAt: '2026-08-11 00:00:00'
      },
      {
        id: 'pub-vmware',
        canonicalName: 'Broadcom / VMware',
        aliases: ['VMware', 'VM Ware', 'VMware Inc.', 'Broadcom VMware'],
        website: 'https://www.vmware.com',
        createdAt: '2026-08-11 00:00:00',
        updatedAt: '2026-08-11 00:00:00'
      },
      {
        id: 'pub-canonical',
        canonicalName: 'Canonical',
        aliases: ['Canonical Ltd.', 'Ubuntu Canonical'],
        website: 'https://canonical.com',
        createdAt: '2026-08-11 00:00:00',
        updatedAt: '2026-08-11 00:00:00'
      }
    ];

    defaultPublishers.forEach(p => this.publishers.set(p.id, p));
  }

  private seedDefaultCanonicalProducts() {
    const defaultProducts: CanonicalSoftwareProduct[] = [
      {
        id: 'prod-m365-e3',
        publisherId: 'pub-msft',
        publisherName: 'Microsoft',
        productName: 'Microsoft 365',
        productFamily: 'Microsoft 365 Suite',
        edition: 'E3',
        majorVersion: '16',
        minorVersion: '0',
        architecture: 'x64',
        softwareType: 'SaaS',
        category: 'Productivity',
        lifecycleStatus: 'Active',
        identifiers: {
          cpe: 'cpe:2.3:a:microsoft:365_apps:16.0:*:*:*:*:*:*:*',
          partNumber: 'AAD-34721'
        },
        variants: ['Microsoft Office 365 E3', 'MS Office 365 E3', 'Office365-E3', 'Microsoft 365 E3', 'O365 E3', 'MSFT OFC 365 E3'],
        createdAt: '2026-08-11 00:00:00',
        updatedAt: '2026-08-11 00:00:00'
      },
      {
        id: 'prod-sql-server-2022',
        publisherId: 'pub-msft',
        publisherName: 'Microsoft',
        productName: 'SQL Server',
        productFamily: 'Database Systems',
        edition: 'Enterprise',
        majorVersion: '2022',
        minorVersion: '16.0',
        architecture: 'x64',
        softwareType: 'Database',
        category: 'Database',
        lifecycleStatus: 'Active',
        identifiers: {
          cpe: 'cpe:2.3:a:microsoft:sql_server:2022:*:*:*:*:*:*:*'
        },
        variants: ['MS SQL Server 2022 Enterprise', 'Microsoft SQL Server 2022', 'SQLServer-2022-Ent'],
        createdAt: '2026-08-11 00:00:00',
        updatedAt: '2026-08-11 00:00:00'
      },
      {
        id: 'prod-adobe-acrobat-pro',
        publisherId: 'pub-adobe',
        publisherName: 'Adobe',
        productName: 'Acrobat',
        productFamily: 'Acrobat Suite',
        edition: 'Pro',
        majorVersion: '2023',
        softwareType: 'Application',
        category: 'Productivity',
        lifecycleStatus: 'Active',
        variants: ['Adobe Acrobat Pro DC', 'Acrobat Pro DC', 'Adobe Acrobat Reader Pro'],
        createdAt: '2026-08-11 00:00:00',
        updatedAt: '2026-08-11 00:00:00'
      }
    ];

    defaultProducts.forEach(prod => this.products.set(prod.id, prod));
  }

  private seedDefaultAliases() {
    const defaultAliases: SoftwareAliasMapping[] = [
      {
        id: 'alias-o365',
        rawPattern: 'o365',
        canonicalPublisher: 'Microsoft',
        canonicalProduct: 'Microsoft 365',
        canonicalEdition: 'E3',
        createdBy: 'System Engine',
        createdAt: '2026-08-11 00:00:00'
      },
      {
        id: 'alias-msofc',
        rawPattern: 'ms office',
        canonicalPublisher: 'Microsoft',
        canonicalProduct: 'Microsoft 365',
        createdBy: 'System Engine',
        createdAt: '2026-08-11 00:00:00'
      }
    ];

    defaultAliases.forEach(a => this.aliasMappings.set(a.id, a));
  }

  /**
   * String transformations before matching
   */
  public normalizeRawString(rawInput: string): { 
    cleanString: string; 
    publisherHint?: string; 
    editionHint?: string; 
    versionHint?: string; 
    archHint?: 'x64' | 'x86' | 'ARM' 
  } {
    if (!rawInput) return { cleanString: '' };

    let cleaned = rawInput.trim();
    
    // Extract Architecture
    let archHint: 'x64' | 'x86' | 'ARM' | undefined;
    if (/(64-bit|x64|amd64)/i.test(cleaned)) {
      archHint = 'x64';
    } else if (/(32-bit|x86|i386)/i.test(cleaned)) {
      archHint = 'x86';
    } else if (/(arm64|arm)/i.test(cleaned)) {
      archHint = 'ARM';
    }

    // Extract Edition
    let editionHint: string | undefined;
    const editionPatterns = ['E3', 'E5', 'Enterprise', 'Professional', 'Pro', 'Standard', 'Business Premium', 'Community'];
    for (const ed of editionPatterns) {
      const re = new RegExp(`\\b${ed}\\b`, 'i');
      if (re.test(cleaned)) {
        editionHint = ed;
        break;
      }
    }

    // Extract Version
    let versionHint: string | undefined;
    const versionMatch = cleaned.match(/\b(v?\d+(\.\d+)+|\d{4})\b/i);
    if (versionMatch) {
      versionHint = versionMatch[0].replace(/^v/i, '');
    }

    // Resolve Publisher Alias in string
    let publisherHint: string | undefined;
    for (const pub of Array.from(this.publishers.values())) {
      for (const alias of [pub.canonicalName, ...pub.aliases]) {
        const regex = new RegExp(`^${alias.replace('.', '\\.')}\\b`, 'i');
        if (regex.test(cleaned)) {
          publisherHint = pub.canonicalName;
          break;
        }
      }
      if (publisherHint) break;
    }

    // Clean special punctuation & brackets
    const cleanString = cleaned
      .replace(/[()\[\]]/g, ' ')
      .replace(/[-_]/g, ' ')
      .replace(/\s+/g, ' ')
      .toLowerCase();

    return { cleanString, publisherHint, editionHint, versionHint, archHint };
  }

  /**
   * Main Normalization Function
   */
  public normalizeSoftwareString(rawDiscoveredString: string, tenantId: string = 'tenant-global'): SoftwareNormalizationResult {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const explanation: string[] = [];

    if (!rawDiscoveredString || rawDiscoveredString.trim() === '') {
      return {
        rawDiscoveredString,
        cleanedNormalizedString: '',
        confidenceScore: 0,
        normalizationStatus: 'Unnormalized',
        matchingMethod: 'Unmatched',
        explanation: ['Empty raw string input provided.'],
        normalizedAt: timestamp,
        tenantId
      };
    }

    // 1. Check Learned User Decisions Mapping First
    const learnedKey = rawDiscoveredString.toLowerCase().trim();
    if (this.learnedUserMappings.has(learnedKey)) {
      const learned = this.learnedUserMappings.get(learnedKey)!;
      explanation.push(`Matched via Administrator Learned Decision mapping rule.`);
      return {
        rawDiscoveredString,
        cleanedNormalizedString: learnedKey,
        matchedPublisher: learned.publisher,
        matchedProduct: learned.product,
        matchedEdition: learned.edition,
        confidenceScore: 100,
        normalizationStatus: 'Verified',
        matchingMethod: 'Alias Match',
        explanation,
        normalizedAt: timestamp,
        tenantId
      };
    }

    // 2. Perform String Normalization Parsing
    const parsed = this.normalizeRawString(rawDiscoveredString);
    explanation.push(`Cleaned normalized string: "${parsed.cleanString}".`);

    if (parsed.publisherHint) {
      explanation.push(`Resolved Canonical Publisher: "${parsed.publisherHint}".`);
    }

    if (parsed.editionHint) {
      explanation.push(`Extracted Software Edition: "${parsed.editionHint}".`);
    }

    if (parsed.versionHint) {
      explanation.push(`Extracted Software Version: "${parsed.versionHint}".`);
    }

    // 3. Match against Canonical Product Repository
    let bestProductMatch: { product: CanonicalSoftwareProduct; score: number; method: SoftwareNormalizationResult['matchingMethod'] } | null = null;

    const catalogProducts = Array.from(this.products.values());

    for (const prod of catalogProducts) {
      let score = 0;
      let method: SoftwareNormalizationResult['matchingMethod'] = 'Fuzzy Match';

      // Check variant exact match
      const exactVariantMatch = prod.variants.some(v => v.toLowerCase() === rawDiscoveredString.toLowerCase());
      if (exactVariantMatch) {
        score = 98;
        method = 'Exact Name';
      } else {
        // Evaluate similarity score
        if (parsed.publisherHint && parsed.publisherHint.toLowerCase() === prod.publisherName.toLowerCase()) {
          score += 40;
        }

        if (parsed.cleanString.includes(prod.productName.toLowerCase())) {
          score += 40;
        }

        if (parsed.editionHint && prod.edition && parsed.editionHint.toLowerCase() === prod.edition.toLowerCase()) {
          score += 15;
        }
      }

      if (score > (bestProductMatch?.score || 0)) {
        bestProductMatch = { product: prod, score, method };
      }
    }

    if (bestProductMatch && bestProductMatch.score >= 80) {
      const p = bestProductMatch.product;
      explanation.push(`High confidence match with product ID [${p.id}] (${bestProductMatch.score}% similarity).`);
      return {
        rawDiscoveredString,
        cleanedNormalizedString: parsed.cleanString,
        canonicalProductId: p.id,
        matchedPublisher: p.publisherName,
        matchedProduct: p.productName,
        matchedEdition: parsed.editionHint || p.edition,
        extractedVersion: parsed.versionHint || p.majorVersion,
        extractedArchitecture: parsed.archHint || p.architecture,
        confidenceScore: bestProductMatch.score,
        normalizationStatus: bestProductMatch.score >= 90 ? 'Normalized' : 'Possible Match',
        matchingMethod: bestProductMatch.method,
        explanation,
        normalizedAt: timestamp,
        tenantId
      };
    } else if (bestProductMatch && bestProductMatch.score >= 50) {
      const p = bestProductMatch.product;
      explanation.push(`Low confidence match (${bestProductMatch.score}%). Flagged for Admin Review.`);
      return {
        rawDiscoveredString,
        cleanedNormalizedString: parsed.cleanString,
        canonicalProductId: p.id,
        matchedPublisher: p.publisherName,
        matchedProduct: p.productName,
        matchedEdition: parsed.editionHint || p.edition,
        extractedVersion: parsed.versionHint,
        confidenceScore: bestProductMatch.score,
        normalizationStatus: 'Needs Review',
        matchingMethod: 'Fuzzy Match',
        explanation,
        normalizedAt: timestamp,
        tenantId
      };
    }

    // Fallback: Unmatched
    explanation.push(`No catalog product reached minimum confidence threshold (50%).`);
    return {
      rawDiscoveredString,
      cleanedNormalizedString: parsed.cleanString,
      confidenceScore: 20,
      normalizationStatus: 'Unnormalized',
      matchingMethod: 'Unmatched',
      explanation,
      normalizedAt: timestamp,
      tenantId
    };
  }

  /**
   * Learn Admin Decision for future automated normalization
   */
  public learnMappingDecision(rawString: string, canonicalPublisher: string, canonicalProduct: string, edition?: string) {
    this.learnedUserMappings.set(rawString.toLowerCase().trim(), {
      publisher: canonicalPublisher,
      product: canonicalProduct,
      edition
    });
  }

  /**
   * Execute Batch Normalization Simulation over array of raw strings
   */
  public runBatchNormalization(rawStrings: string[], tenantId: string = 'tenant-global'): {
    results: SoftwareNormalizationResult[];
    batchReport: NormalizationCatalogBatchReport;
  } {
    const results = rawStrings.map(str => this.normalizeSoftwareString(str, tenantId));

    let normalizedCount = 0;
    let needsReviewCount = 0;
    let unnormalizedCount = 0;
    let totalScore = 0;

    results.forEach(res => {
      totalScore += res.confidenceScore;
      if (res.normalizationStatus === 'Normalized' || res.normalizationStatus === 'Verified') {
        normalizedCount++;
      } else if (res.normalizationStatus === 'Needs Review' || res.normalizationStatus === 'Possible Match') {
        needsReviewCount++;
      } else {
        unnormalizedCount++;
      }
    });

    const batchReport: NormalizationCatalogBatchReport = {
      totalRecordsProcessed: rawStrings.length,
      normalizedCount,
      needsReviewCount,
      unnormalizedCount,
      averageConfidencePct: rawStrings.length > 0 ? Math.round(totalScore / rawStrings.length) : 0,
      processedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    return { results, batchReport };
  }

  // Getters & Mutators for Catalog Administration
  public getPublishers(): PublisherCatalogEntry[] {
    return Array.from(this.publishers.values());
  }

  public getProducts(): CanonicalSoftwareProduct[] {
    return Array.from(this.products.values());
  }

  public getAliasMappings(): SoftwareAliasMapping[] {
    return Array.from(this.aliasMappings.values());
  }

  public addPublisher(pub: PublisherCatalogEntry) {
    this.publishers.set(pub.id, pub);
  }

  public addProduct(prod: CanonicalSoftwareProduct) {
    this.products.set(prod.id, prod);
  }

  public addAlias(alias: SoftwareAliasMapping) {
    this.aliasMappings.set(alias.id, alias);
  }
}

export const softwareNormalizationCatalogEngine = new SoftwareNormalizationCatalogEngine();
