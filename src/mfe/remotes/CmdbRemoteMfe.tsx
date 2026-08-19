// ==================== REMOTE MFE: CMDB ====================
import React from 'react';
import { Database } from 'lucide-react';
import { MfeUserContext } from '../types/mfeTypes';
import { Card, Table, Badge } from '../design_system/ItamUiDesignSystem';

export const CmdbRemoteMfe: React.FC<{ userCtx: MfeUserContext }> = ({ userCtx }) => {
  const headers = ['CI ID', 'Configuration Item', 'CI Class', 'Relationships', 'Health Status'];
  const rows = [
    ['CI-5001', 'prod-db-cluster-01.internal', 'Database Cluster', '12 Connected CIs', <Badge key="1" variant="active">HEALTHY</Badge>],
    ['CI-5002', 'k8s-ingress-gateway-delhi', 'API Gateway', '48 Connected CIs', <Badge key="2" variant="active">HEALTHY</Badge>],
  ];

  return (
    <Card
      title="CMDB & Topology Graph Remote MFE (@itam/mfe-cmdb)"
      subtitle={`Configuration Management Database • Tenant: ${userCtx.tenantName}`}
    >
      <Table headers={headers} rows={rows} />
    </Card>
  );
};
