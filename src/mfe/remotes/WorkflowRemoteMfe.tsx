// ==================== REMOTE MFE: WORKFLOW ====================
import React from 'react';
import { Workflow } from 'lucide-react';
import { MfeUserContext } from '../types/mfeTypes';
import { Card, Table, Badge, Button } from '../design_system/ItamUiDesignSystem';

export const WorkflowRemoteMfe: React.FC<{ userCtx: MfeUserContext }> = ({ userCtx }) => {
  const headers = ['Ticket ID', 'Workflow Type', 'Requester', 'SLA Target', 'Approval Status'];
  const rows = [
    ['REQ-9001', 'Hardware Laptop Request', 'Ananya Roy', '4 Hours SLA', <Badge key="1" variant="pending">PENDING APPROVAL</Badge>],
    ['REQ-9002', 'Server Retirement Workflow', 'Vikram Patel', 'Instant Auto', <Badge key="2" variant="active">COMPLETED</Badge>],
  ];

  return (
    <Card
      title="ITSM Workflows Remote MFE (@itam/mfe-workflows)"
      subtitle={`Automated Approval Engine • Tenant: ${userCtx.tenantName}`}
      action={<Button size="sm">New Request</Button>}
    >
      <Table headers={headers} rows={rows} />
    </Card>
  );
};
