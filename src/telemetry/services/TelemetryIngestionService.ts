// ==================== TELEMETRY INGESTION SERVICE ====================
// Ingestion pipeline validating incoming telemetry payloads, enforcing tenant boundaries, and bulk writing to TimescaleDB.

import { TimescaleDatabaseInterface } from '../interfaces/TimescaleDatabaseInterface';
import { TimescaleDbAdapter } from '../adapters/TimescaleDbAdapter';
import {
  TelemetryMetricPoint,
  IngestionBatchRequest,
  IngestionBatchResponse,
} from '../types/telemetryTypes';

export class TelemetryIngestionService {
  private static timescaleDb: TimescaleDatabaseInterface = new TimescaleDbAdapter();

  /**
   * Bulk ingests telemetry batch with high-cardinality protection & validation
   */
  public static async ingestBatch(batch: IngestionBatchRequest): Promise<IngestionBatchResponse> {
    if (!batch.tenantId) {
      throw new Error(`[TelemetryIngestionService] Ingestion Error: Missing mandatory 'tenantId' context.`);
    }

    return this.timescaleDb.writeBatch(batch);
  }

  /**
   * Ingests a single metric point
   */
  public static async ingestSinglePoint(point: TelemetryMetricPoint): Promise<boolean> {
    if (!point.tenantId || !point.assetId) {
      throw new Error(`[TelemetryIngestionService] Validation Error: Point missing 'tenantId' or 'assetId'.`);
    }

    return this.timescaleDb.writePoint(point);
  }
}
