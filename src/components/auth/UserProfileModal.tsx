import React, { useState } from 'react';
import { X, User as UserIcon, Mail, Briefcase, Phone, Globe2, Shield, Lock, CheckCircle2, AlertCircle, Users } from 'lucide-react';
import { User } from '../../types';
import { useApp } from '../../context/AppContext';

interface UserProfileModalProps {
  user: User;
  onClose: () => void;
  onUpdateProfile: (data: any) => Promise<{ success: boolean; error?: string }>;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  onClose,
  onUpdateProfile,
}) => {
  const { setShowUserManagementModal } = useApp();
  const safeName = user?.name || '';
  const [firstName, setFirstName] = useState(safeName ? safeName.split(' ')[0] || '' : '');
  const [lastName, setLastName] = useState(safeName ? safeName.split(' ').slice(1).join(' ') || '' : '');
  const [jobTitle, setJobTitle] = useState('Enterprise ITAM Administrator');
  const [phone, setPhone] = useState('+1 (555) 019-2831');
  const [country, setCountry] = useState('United States');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await onUpdateProfile({
        firstName,
        lastName,
        jobTitle,
        phone,
        country,
        password: password || undefined,
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Failed to update profile.');
      } else {
        setSuccessMsg('Profile details updated successfully.');
        setPassword('');
      }
    } catch (err: any) {
      setErrorMsg('Error updating profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-sans selection:bg-red-600 selection:text-white">
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="bg-black p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-red-950 border border-red-800 flex items-center justify-center text-red-500 font-bold font-mono">
              {user.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">USER PROFILE & PREFERENCES</h2>
              <p className="text-[10px] text-zinc-400 font-mono">ROLE: {user.role} | TENANT: {user.tenantId}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          {errorMsg && (
            <div className="bg-red-950/80 border border-red-800 text-red-300 p-3 rounded text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 p-3 rounded text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono font-bold text-zinc-300 mb-1 uppercase">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono font-bold text-zinc-300 mb-1 uppercase">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-xs text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold text-zinc-300 mb-1 uppercase">Work Email (Immutable)</label>
            <input
              type="email"
              disabled
              value={user.email}
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-500 font-mono cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono font-bold text-zinc-300 mb-1 uppercase">Job Title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono font-bold text-zinc-300 mb-1 uppercase">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-xs text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold text-zinc-300 mb-1 uppercase">Change Password (Optional)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
              className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-xs text-white font-mono placeholder-zinc-600"
            />
          </div>

          <div className="bg-black/60 p-3 border border-zinc-800 rounded text-[11px] font-mono text-zinc-400 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white font-bold block">ASSIGNED RBAC PERMISSIONS</span>
              {(user.role === 'SOFTWARE_SUPER_ADMIN' ||
                user.role === 'Software Super Admin' ||
                user.role === 'CLIENT_ADMIN' ||
                user.role === 'Client Admin' ||
                user.role === 'CLIENT_SUPER_ADMIN' ||
                user.role === 'Super Admin' ||
                (user as any).isAdmin === true ||
                (user as any).isSuperAdmin === true) && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setShowUserManagementModal(true);
                  }}
                  className="text-[10px] bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-amber-300 hover:text-white px-2 py-1 rounded flex items-center space-x-1 cursor-pointer font-bold"
                >
                  <Users className="w-3 h-3 text-amber-400" />
                  <span>Open RBAC Matrix & User Manager</span>
                </button>
              )}
            </div>
            <p>Role: <span className="text-red-400 font-bold">{user.role}</span> • Scoped Access Policy Enforced</p>
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono font-bold text-zinc-400 hover:text-white cursor-pointer"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-mono font-bold text-white bg-red-600 hover:bg-red-500 rounded cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'SAVING...' : 'SAVE CHANGES'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
