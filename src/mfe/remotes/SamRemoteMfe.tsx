// ==================== REMOTE MFE: SAM ====================
import React, { useState, useEffect } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import { MfeUserContext } from '../types/mfeTypes';
import { Card, Button, Table, Badge, Loader } from '../design_system/ItamUiDesignSystem';
import { MfeApiClient } from '../client/ApiClient';

export const SamRemoteMfe: React.FC<{ userCtx: MfeUserContext }> = ({ userCtx }) => {
  const [sw, setSw] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSamData();
  }, [userCtx.tenantId]);

  const loadSamData = async () => {
    setLoading(true);
    const res = await MfeApiClient.restRequest('GET', '/sam', userCtx);
    if (res.success && res.data) {
      setSw(res.data);
    }
    setLoading(false);
  };

  const headers = ['Software ID', 'Title', 'Purchased', 'Used', 'Compliance Status', 'Action'];
  const rows = sw.map((s) => [
    <span key="id" className="font-bold text-white">{s.id}</span>,
    <span key="name" className="text-zinc-300">{s.name}</span>,
    <span key="p" className="text-zinc-300">{s.licensesPurchased}</span>,
    <span key="u" className="text-zinc-300">{s.licensesUsed}</span>,
    <Badge key="c" variant={s.compliance === 'COMPLIANT' ? 'active' : 'alert'}>{s.compliance}</Badge>,
    <Button key="b" size="sm" variant="danger">Reconcile</Button>
  ]);

  return (
    <Card
      title="Software Asset Management Remote MFE (@itam/mfe-sam)"
      subtitle={`Compliance & Licensing Engine • Tenant: ${userCtx.tenantName}`}
      action={<Button size="sm" onClick={loadSamData}><RefreshCw className="w-3.5 h-3.5 mr-1" /> Re-audit</Button>}
    >
      {loading ? <Loader label="Syncing Software Licenses..." /> : <Table headers={headers} rows={rows} />}
    </Card>
  );
};
