// ==================== REMOTE MFE: DISCOVERY ====================
import React from 'react';
import { Search } from 'lucide-react';
import { MfeUserContext } from '../types/mfeTypes';
import { Card, Table, Badge, Button } from '../design_system/ItamUiDesignSystem';

export const DiscoveryRemoteMfe: React.FC<{ userCtx: MfeUserContext }> = ({ userCtx }) => {
  const headers = ['Subnet Range', 'Protocol', 'Devices Found', 'Last Scan Time', 'Scan Status'];
  const rows = [
    ['192.168.10.0/24', 'SNMP v3 / SSH', '214', '10 mins ago', <Badge key="1" variant="active">COMPLETED</Badge>],
    ['10.200.0.0/16', 'WMI / Agentless', '1,420', 'In Progress', <Badge key="2" variant="pending">RUNNING</Badge>],
  ];

  return (
    <Card
      title="Discovery Engine Remote MFE (@itam/mfe-discovery)"
      subtitle={`Agentless Network & Cloud Scanner • Tenant: ${userCtx.tenantName}`}
      action={<Button size="sm">Trigger Scan</Button>}
    >
      <Table headers={headers} rows={rows} />
    </Card>
  );
};
