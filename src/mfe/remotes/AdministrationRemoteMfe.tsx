// ==================== REMOTE MFE: ADMINISTRATION ====================
import React from 'react';
import { Settings } from 'lucide-react';
import { MfeUserContext } from '../types/mfeTypes';
import { Card, Table, Badge, Button } from '../design_system/ItamUiDesignSystem';

export const AdministrationRemoteMfe: React.FC<{ userCtx: MfeUserContext }> = ({ userCtx }) => {
  const headers = ['Tenant ID', 'Organization Name', 'Max Assets', 'RBAC Enforced', 'Tenant Status'];
  const rows = [
    ['tenant-kspl-global', 'KSPL Enterprise Global', '500,000', <Badge key="1" variant="active">STRICT RBAC</Badge>, <Badge key="2" variant="active">ACTIVE</Badge>],
    ['tenant-delhi-dc', 'Delhi Data Center Division', '100,000', <Badge key="3" variant="active">STRICT RBAC</Badge>, <Badge key="4" variant="active">ACTIVE</Badge>],
  ];

  return (
    <Card
      title="Administration & RBAC Remote MFE (@itam/mfe-admin)"
      subtitle={`Tenant Partitioning & Governance • Tenant: ${userCtx.tenantName}`}
      action={<Button size="sm">Provision Tenant</Button>}
    >
      <Table headers={headers} rows={rows} />
    </Card>
  );
};
