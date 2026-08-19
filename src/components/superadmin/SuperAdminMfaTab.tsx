import React, { useState } from 'react';
import {
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  Search,
  Check,
  X,
} from 'lucide-react';
import { MfaResetRequest, User } from '../../types';

interface SuperAdminMfaTabProps {
  currentUser: User;
  mfaRequests: MfaResetRequest[];
  onRefresh: () => void;
}

export const SuperAdminMfaTab: React.FC<SuperAdminMfaTabProps> = ({
  currentUser,
  mfaRequests,
  onRefresh,
}) => {
  const [selectedRequest, setSelectedRequest] = useState<MfaResetRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleApprove = async (requestId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/super-admin/mfa-requests/${requestId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewerName: currentUser.name }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setNotification({ type: 'error', message: data.error || 'Failed to approve reset request.' });
      } else {
        setNotification({
          type: 'success',
          message: data.message || 'MFA credentials reset. User notified to re-enroll authenticator.',
        });
        setSelectedRequest(null);
        onRefresh();
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Network error during approval.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (requestId: string) => {
    if (!rejectReason.trim()) {
      setNotification({ type: 'error', message: 'Please specify a rejection reason.' });
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/super-admin/mfa-requests/${requestId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason, reviewerName: currentUser.name }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setNotification({ type: 'error', message: data.error || 'Failed to reject reset request.' });
      } else {
        setNotification({ type: 'success', message: data.message || 'MFA reset request rejected.' });
        setSelectedRequest(null);
        setRejectReason('');
        onRefresh();
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Network error during rejection.' });
    } finally {
      setActionLoading(false);
    }
  };

  const pendingCount = mfaRequests.filter((r) => r.status === 'Pending').length;

  return (
    <div className="space-y-6">
      {notification && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
            notification.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
              : 'bg-red-950/60 border-red-800 text-red-300'
          }`}
        >
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)}>
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      )}

      {/* MFA Telemetry Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Reset Queue</span>
            <div className="w-8 h-8 rounded-lg bg-amber-600/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-400">{pendingCount}</div>
          <span className="text-[11px] text-slate-400 block mt-1">Awaiting Super Admin authorization</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">MFA Protocol Standard</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-600/10 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-white">RFC 6238 TOTP</div>
          <span className="text-[11px] text-emerald-400 block mt-1">AES-256-GCM Encrypted Secrets</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Supported Authenticators</span>
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-400 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-bold text-slate-200">Google & Microsoft Authenticator</div>
          <span className="text-[11px] text-slate-400 block mt-1">Plus 8-word offline recovery codes</span>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-500" />
              <span>MFA Reset & Recovery Ticket Authorization Queue</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Review locked-out user requests to revoke lost authenticator keys and generate emergency re-enrollment tokens.
            </p>
          </div>
          <span className="text-xs text-slate-500">{mfaRequests.length} Total Records</span>
        </div>

        {mfaRequests.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No MFA reset requests currently pending review.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Requested At</th>
                  <th className="p-4">User Name & Email</th>
                  <th className="p-4">Tenant Scope</th>
                  <th className="p-4">User Reason</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {mfaRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                      {new Date(req.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-white text-sm">{req.userName}</div>
                      <div className="text-[11px] text-slate-500">{req.userEmail}</div>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-red-400 font-semibold">{req.tenantId}</span>
                    </td>
                    <td className="p-4 max-w-xs truncate text-slate-300" title={req.reason}>
                      {req.reason}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          req.status === 'Pending'
                            ? 'bg-amber-950 text-amber-400 border-amber-800 animate-pulse'
                            : req.status === 'Approved'
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                            : 'bg-red-950 text-red-400 border-red-800'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {req.status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(req.id)}
                            disabled={actionLoading}
                            className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => setSelectedRequest(req)}
                            className="py-1.5 px-3 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500">
                          Reviewed by {req.reviewedBy || 'Admin'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* REJECT MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Reject MFA Reset Request</h3>
              <button onClick={() => setSelectedRequest(null)}>
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                Rejecting request for <strong className="text-white">{selectedRequest.userName}</strong> (
                {selectedRequest.userEmail}).
              </p>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Reason for Rejection *</label>
                <textarea
                  required
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Identity could not be verified via secondary HR channel."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-3 text-xs">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleReject(selectedRequest.id)}
                disabled={actionLoading || !rejectReason.trim()}
                className="py-2 px-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold disabled:opacity-40"
              >
                {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
