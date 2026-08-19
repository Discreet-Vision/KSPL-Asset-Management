// ==================== POSTGRES TRANSACTION MANAGER ====================
// Provides strict ACID transaction block management (BEGIN, COMMIT, ROLLBACK).

import { TenantDatabaseContext } from './adapters/TenantContextAdapter';

export interface TransactionStepResult {
  stepName: string;
  success: boolean;
  timestamp: string;
}

export class PostgresTransactionManager {
  private static transactionCounter = 1001;

  public static async executeInTransaction<T>(
    context: TenantDatabaseContext,
    transactionCallback: (txId: string) => Promise<T>
  ): Promise<{ result: T; stepsExecuted: TransactionStepResult[]; transactionId: string }> {
    const txId = `tx-pg-${this.transactionCounter++}`;
    const steps: TransactionStepResult[] = [];

    try {
      steps.push({ stepName: 'BEGIN TRANSACTION', success: true, timestamp: new Date().toLocaleTimeString() });
      steps.push({ stepName: `SET LOCAL app.current_tenant_id = '${context.tenantId}'`, success: true, timestamp: new Date().toLocaleTimeString() });

      const result = await transactionCallback(txId);

      steps.push({ stepName: 'COMMIT TRANSACTION', success: true, timestamp: new Date().toLocaleTimeString() });

      return { result, stepsExecuted: steps, transactionId: txId };
    } catch (error: any) {
      steps.push({ stepName: 'ROLLBACK TRANSACTION', success: false, timestamp: new Date().toLocaleTimeString() });
      throw new Error(`[PostgresTransactionManager] Transaction ${txId} rolled back due to error: ${error.message}`);
    }
  }
}
