// ==================== REMOTE MFE: ITAM ASSETS ====================
import React, { useState, useEffect } from 'react';
import { Boxes, Plus, RefreshCw, Server, Laptop } from 'lucide-react';
import { MfeUserContext } from '../types/mfeTypes';
import { Card, Button, Table, Badge, Loader } from '../design_system/ItamUiDesignSystem';
import { MfeApiClient } from '../client/ApiClient';

export const ItamRemoteMfe: React.FC<{ userCtx: MfeUserContext }> = ({ userCtx }) => {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssets();
  }, [userCtx.tenantId]);

  const loadAssets = async () => {
    setLoading(true);
    const res = await MfeApiClient.restRequest('GET', '/assets', userCtx);
    if (res.success && res.data) {
      setAssets(res.data);
    }
    setLoading(false);
  };

  const headers = ['Asset ID', 'Hostname / Name', 'Category', 'Status', 'Owner', 'Actions'];
  const rows = assets.map((a) => [
    <span key="id" className="font-bold text-white">{a.id}</span>,
    <span key="name" className="text-zinc-300">{a.name}</span>,
    <span key="type" className="text-zinc-400">{a.type}</span>,
    <Badge key="status" variant={a.status === 'ACTIVE' ? 'active' : 'pending'}>{a.status}</Badge>,
    <span key="owner" className="text-zinc-300">{a.owner}</span>,
    <Button key="btn" size="sm" variant="outline">Inspect</Button>
  ]);

  return (
    <div className="space-y-4">
      <Card
        title="IT Asset Management Remote MFE (@itam/mfe-assets)"
        subtitle={`Isolated Remote • Tenant: ${userCtx.tenantName}`}
        action={
          <Button size="sm" onClick={loadAssets}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
          </Button>
        }
      >
        {loading ? <Loader label="Fetching Assets from Remote Micro-Frontend API..." /> : <Table headers={headers} rows={rows} />}
      </Card>
    </div>
  );
};
