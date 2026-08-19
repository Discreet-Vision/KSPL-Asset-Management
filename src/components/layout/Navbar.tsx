import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Bot,
  Building2,
  UserCheck,
  Bell,
  Smartphone,
  Sparkles,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  Settings,
  Crown,
  ShieldCheck,
  Users,
} from 'lucide-react';

export const Navbar: React.FC<{ onOpenSearch: () => void }> = ({ onOpenSearch }) => {
  const {
    currentUser,
    setCurrentUser,
    allUsers,
    currentTenant,
    setCurrentTenant,
    allTenants,
    setIsAiDrawerOpen,
    policyViolations,
    setActiveModule,
    activeModule,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    setShowUserProfileModal,
    setShowOrgSettingsModal,
    setShowUserManagementModal,
    logout,
  } = useApp();

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const openViolations = (policyViolations || []).filter((v) => v?.status === 'Open');

  return (
    <header className="border-b border-zinc-800 h-16 shrink-0 flex items-center justify-between px-3 sm:px-6 z-30">
      {/* Brand Logo, Hamburger & Name */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Mobile Sidebar Toggle Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 rounded focus:outline-none cursor-pointer"
          aria-label="Toggle navigation drawer"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5 text-red-500" /> : <Menu className="w-5 h-5 text-white" />}
        </button>

        <div className="flex items-center space-x-2 cursor-pointer shrink-0" onClick={() => setActiveModule('dashboard')}>
          <div className="bg-red-600 text-white font-black text-base sm:text-lg px-2 sm:px-2.5 py-1 rounded tracking-wider border border-red-500 shrink-0">
            KSPL
          </div>
          <div className="hidden sm:block shrink-0">
            <span className="font-bold text-white text-sm sm:text-base tracking-tight block leading-none whitespace-nowrap">ITAM + CMDB</span>
            <span className="text-[9px] sm:text-[10px] text-zinc-400 font-mono tracking-widest block uppercase whitespace-nowrap">System of Record</span>
          </div>
        </div>

        {/* Tenant Display & Controls */}
        <div className="hidden lg:flex items-center space-x-1 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-300">
          <Building2 className="w-3.5 h-3.5 text-red-500 shrink-0" />
          {currentUser?.role === 'SOFTWARE_SUPER_ADMIN' ? (
            <select
              value={currentTenant.id}
              onChange={(e) => {
                const t = allTenants.find((item) => item.id === e.target.value);
                if (t) setCurrentTenant(t);
              }}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              {allTenants.map((t) => (
                <option key={t.id} value={t.id} className="bg-zinc-900 text-white">
                  {t.name} [{t.region}]
                </option>
              ))}
            </select>
          ) : (
            <span className="text-white font-medium px-1 truncate max-w-[160px]">
              {currentTenant.name} [{currentTenant.region}]
            </span>
          )}
          <button
            onClick={() => setShowOrgSettingsModal(true)}
            title="Tenant Settings"
            className="p-1 hover:text-white text-zinc-400 cursor-pointer border-l border-zinc-800 ml-1"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Global Search Bar Trigger */}
      <div className="flex-1 max-w-xs sm:max-w-md md:max-w-xl mx-2 sm:mx-4">
        <button
          onClick={onOpenSearch}
          className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 rounded-md px-2.5 sm:px-3 py-1.5 flex items-center justify-between text-xs transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-2 truncate">
            <Search className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="truncate text-left text-[11px] sm:text-xs">Search CIs, Asset Tags, Serials...</span>
          </div>
          <kbd className="hidden md:inline-block bg-black text-zinc-400 border border-zinc-800 rounded px-1.5 py-0.5 text-[10px] font-mono shrink-0 ml-1">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Action Controls & Profile */}
      <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
        {/* Mobile View Toggle */}
        <button
          onClick={() => setActiveModule('mobile')}
          title="Mobile Field Technician Operations"
          className={`p-2 rounded border text-xs transition-colors flex items-center space-x-1 cursor-pointer ${
            activeModule === 'mobile'
              ? 'bg-red-600 text-white border-red-500'
              : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
          }`}
        >
          <Smartphone className="w-4 h-4 shrink-0" />
          <span className="hidden xl:inline">Field Ops</span>
        </button>

        {/* AI Copilot Drawer Toggle */}
        <button
          onClick={() => setIsAiDrawerOpen(true)}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-2.5 sm:px-3 py-1.5 rounded flex items-center space-x-1 sm:space-x-1.5 border border-red-500 transition-colors cursor-pointer shadow-sm"
        >
          <Bot className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">AI Copilot</span>
          <Sparkles className="w-3 h-3 text-white animate-pulse shrink-0" />
        </button>

        {/* Notifications / Violation Alert */}
        <button
          onClick={() => setActiveModule('policies')}
          className="relative p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded border border-zinc-800 cursor-pointer"
          title="Policy Violations Alert"
        >
          <Bell className="w-4 h-4 shrink-0" />
          {openViolations.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-black">
              {openViolations.length}
            </span>
          )}
        </button>

        {/* User Account / Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center space-x-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded px-2.5 py-1 text-xs text-white cursor-pointer"
          >
            <div className="w-5 h-5 rounded bg-red-600 text-white flex items-center justify-center text-[10px] font-bold font-mono">
              {(currentUser?.name || currentUser?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <span className="hidden md:inline font-mono text-[11px] font-bold">{currentUser?.name || 'User'}</span>
            {currentUser?.role === 'SOFTWARE_SUPER_ADMIN' && (
              <span className="hidden xl:inline-block px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-red-600 text-white tracking-wider">
                SUPER ADMIN
              </span>
            )}
          </button>

          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-52 bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl z-50 p-1 font-mono text-xs">
              <div className="p-2 border-b border-zinc-800">
                <p className="font-bold text-white truncate">{currentUser.name}</p>
                <p className="text-[10px] text-zinc-400 truncate">{currentUser.email}</p>
                <span className="inline-block mt-1 px-1.5 py-0.5 bg-red-950 text-red-400 border border-red-800 rounded text-[9px]">
                  {currentUser.role}
                </span>
              </div>

              <button
                onClick={() => {
                  setShowProfileDropdown(false);
                  setShowUserProfileModal(true);
                }}
                className="w-full text-left px-3 py-2 hover:bg-zinc-900 text-zinc-300 hover:text-white rounded flex items-center space-x-2 cursor-pointer mt-1"
              >
                <UserIcon className="w-3.5 h-3.5 text-zinc-400" />
                <span>User Profile</span>
              </button>

              {(currentUser.role === 'SOFTWARE_SUPER_ADMIN' ||
                currentUser.role === 'Software Super Admin' ||
                currentUser.role === 'CLIENT_ADMIN' ||
                currentUser.role === 'Client Admin' ||
                currentUser.role === 'CLIENT_SUPER_ADMIN' ||
                currentUser.role === 'Super Admin' ||
                (currentUser as any).isAdmin === true ||
                (currentUser as any).isSuperAdmin === true) && (
                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    setShowUserManagementModal(true);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-zinc-900 text-amber-300 hover:text-white rounded flex items-center space-x-2 cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-bold">User Directory & RBAC Matrix</span>
                </button>
              )}

              <button
                onClick={() => {
                  setShowProfileDropdown(false);
                  setActiveModule('security_mfa');
                }}
                className="w-full text-left px-3 py-2 hover:bg-zinc-900 text-zinc-300 hover:text-white rounded flex items-center space-x-2 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
                <span>Security & MFA</span>
              </button>

              {currentUser.role === 'SOFTWARE_SUPER_ADMIN' && (
                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    setActiveModule('super_admin');
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-red-950/60 text-red-400 hover:text-white rounded flex items-center space-x-2 cursor-pointer"
                >
                  <Crown className="w-3.5 h-3.5 text-red-500" />
                  <span className="font-bold">Super Admin Console</span>
                </button>
              )}

              <button
                onClick={() => {
                  setShowProfileDropdown(false);
                  setShowOrgSettingsModal(true);
                }}
                className="w-full text-left px-3 py-2 hover:bg-zinc-900 text-zinc-300 hover:text-white rounded flex items-center space-x-2 cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                <span>Tenant Profile</span>
              </button>

              <div className="border-t border-zinc-800 my-1" />

              <button
                onClick={() => {
                  setShowProfileDropdown(false);
                  logout();
                }}
                className="w-full text-left px-3 py-2 hover:bg-red-950 text-red-400 rounded flex items-center space-x-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
