// ==================== REMOTE MFE: FINANCIALS ====================
import React from 'react';
import { DollarSign } from 'lucide-react';
import { MfeUserContext } from '../types/mfeTypes';
import { Card, Table, Badge } from '../design_system/ItamUiDesignSystem';

export const FinancialRemoteMfe: React.FC<{ userCtx: MfeUserContext }> = ({ userCtx }) => {
  const headers = ['Cost Center', 'Asset Type', 'Total CapEx ($)', 'Depreciated Value ($)', 'TCO Status'];
  const rows = [
    ['CC-101 Engineering', 'Server Infrastructure', '$1,250,000', '$840,000', <Badge key="1" variant="active">OPTIMAL</Badge>],
    ['CC-102 Finance', 'User Workstations', '$450,000', '$210,000', <Badge key="2" variant="pending">DEPRECIATING</Badge>],
    ['CC-103 Sales', 'Mobile Devices', '$180,000', '$60,000', <Badge key="3" variant="alert">RENEWAL DUE</Badge>],
  ];

  return (
    <Card
      title="Financial Asset & TCO Remote MFE (@itam/mfe-financials)"
      subtitle={`Depreciation & Budget Allocation • Tenant: ${userCtx.tenantName}`}
    >
      <Table headers={headers} rows={rows} />
    </Card>
  );
};
