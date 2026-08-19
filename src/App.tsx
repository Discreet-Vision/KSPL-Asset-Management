import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { AiCopilotDrawer } from './components/common/AiCopilotDrawer';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';

// Auth Pages & Modals
import { PublicLandingPage } from './components/landing/PublicLandingPage';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './components/auth/ResetPasswordPage';
import { MfaVerificationPage } from './components/auth/MfaVerificationPage';
import { MfaSecuritySettingsModule } from './components/auth/MfaSecuritySettingsModule';
import { OnboardingWizardModal } from './components/auth/OnboardingWizardModal';
import { UserProfileModal } from './components/auth/UserProfileModal';
import { OrganizationSettingsModal } from './components/auth/OrganizationSettingsModal';
import { UserManagementModal } from './components/auth/UserManagementModal';

// Modules
import { DashboardModule } from './components/modules/DashboardModule';
import { SuperAdminDashboardModule } from './components/modules/SuperAdminDashboardModule';
import { CmdbModule } from './components/modules/CmdbModule';
import { DiscoveryModule } from './components/modules/DiscoveryModule';
import { HardwareAssetsModule } from './components/modules/HardwareAssetsModule';
import { SoftwareAssetsModule } from './components/modules/SoftwareAssetsModule';
import { FinancialsModule } from './components/modules/FinancialsModule';
import { ItsmWorkflowsModule } from './components/modules/ItsmWorkflowsModule';
import { PoliciesVulnerabilitiesModule } from './components/modules/PoliciesVulnerabilitiesModule';
import { AuditReportsModule } from './components/modules/AuditReportsModule';
import { AdminIntegrationsModule } from './components/modules/AdminIntegrationsModule';
import { MobileOpsModule } from './components/modules/MobileOpsModule';
import { EmployeeSelfServiceModule } from './components/modules/EmployeeSelfServiceModule';
import { AssignmentsHistoryModule } from './components/modules/AssignmentsHistoryModule';
import { WorkflowRulesModule } from './components/modules/WorkflowRulesModule';
import { PolicyRulesEngineModule } from './components/modules/PolicyRulesEngineModule';
import { ReconciliationModule } from './components/modules/ReconciliationModule';
import { CmdbFederationModule } from './components/modules/CmdbFederationModule';
import { SoftwareComplianceModule } from './components/modules/SoftwareComplianceModule';
import { AiAnalyticsDashboardModule } from './components/modules/AiAnalyticsDashboardModule';

const AuthenticatedAppLayout: React.FC = () => {
  const {
    activeModule,
    showOnboardingModal,
    setShowOnboardingModal,
    showUserProfileModal,
    setShowUserProfileModal,
    showOrgSettingsModal,
    setShowOrgSettingsModal,
    showUserManagementModal,
    setShowUserManagementModal,
    currentUser,
    currentTenant,
    allUsers,
    departments,
    completeOnboarding,
    updateUserProfile,
    updateTenantProfile,
    provisionUser,
    updateUserRoleAndStatus,
  } = useApp();

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderModule = () => {
    switch (activeModule) {
      case 'super_admin':
        if (currentUser?.role !== 'SOFTWARE_SUPER_ADMIN') {
          return <DashboardModule />;
        }
        return <SuperAdminDashboardModule currentUser={currentUser} />;
      case 'security_mfa':
        return <MfaSecuritySettingsModule currentUser={currentUser} />;
      case 'dashboard':
        return <DashboardModule />;
      case 'cmdb':
        return <CmdbModule />;
      case 'cmdb_federation':
        return <CmdbFederationModule />;
      case 'discovery':
        return <DiscoveryModule />;
      case 'reconciliation':
        return <ReconciliationModule />;
      case 'hardware':
      case 'stockroom':
        return <HardwareAssetsModule />;
      case 'software':
      case 'licenses':
        return <SoftwareAssetsModule />;
      case 'assignments':
        return <AssignmentsHistoryModule />;
      case 'selfservice':
      case 'self-service':
        return <EmployeeSelfServiceModule />;
      case 'procurement':
      case 'contracts':
      case 'financials':
        return <FinancialsModule />;
      case 'itsm':
        return <ItsmWorkflowsModule />;
      case 'workflows':
        return <WorkflowRulesModule />;
      case 'policies':
        return <PolicyRulesEngineModule />;
      case 'vulnerabilities':
        return <PoliciesVulnerabilitiesModule />;
      case 'compliance':
        return <SoftwareComplianceModule />;
      case 'reports':
      case 'audit':
        return <AuditReportsModule />;
      case 'ai':
      case 'analytics':
        return <AiAnalyticsDashboardModule />;
      case 'integrations':
      case 'administration':
      case 'admin':
        return <AdminIntegrationsModule />;
      case 'mobile':
      case 'mobile-ops':
        return <MobileOpsModule />;
      default:
        return <DashboardModule />;
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col font-sans selection:bg-red-600 selection:text-white bg-black">
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        <Sidebar />
        <main className="flex-1 h-full overflow-y-auto custom-scrollbar p-3 sm:p-4">
          {renderModule()}
        </main>
      </div>

      <AiCopilotDrawer />
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Onboarding Wizard Modal */}
      {showOnboardingModal && (
        <OnboardingWizardModal
          organizationName={currentTenant.name}
          onComplete={completeOnboarding}
          onSkip={() => setShowOnboardingModal(false)}
        />
      )}

      {/* User Profile Modal */}
      {showUserProfileModal && (
        <UserProfileModal
          user={currentUser}
          onClose={() => setShowUserProfileModal(false)}
          onUpdateProfile={updateUserProfile}
        />
      )}

      {/* Tenant Settings Modal */}
      {showOrgSettingsModal && (
        <OrganizationSettingsModal
          tenant={currentTenant}
          onClose={() => setShowOrgSettingsModal(false)}
          onUpdateTenant={updateTenantProfile}
        />
      )}

      {/* User Management & RBAC Permissions Modal */}
      {showUserManagementModal && (
        <UserManagementModal
          currentUser={currentUser}
          currentTenant={currentTenant}
          allUsers={allUsers}
          departments={departments}
          onClose={() => setShowUserManagementModal(false)}
          onProvisionUser={provisionUser}
          onUpdateUserRole={updateUserRoleAndStatus}
        />
      )}
    </div>
  );
};

const RootRouterContent: React.FC = () => {
  const {
    authStatus,
    authView,
    setAuthView,
    resetTokenParam,
    tempMfaToken,
    tempMfaUserEmail,
    tempMfaMethod,
    tempMfaSetupRequired,
    completeMfaLogin,
    login,
    register,
    requestPasswordReset,
    resetPassword,
  } = useApp();

  // Loading Screen
  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center font-sans">
        <div className="bg-red-600 text-white p-3 rounded font-black font-mono tracking-wider text-xl mb-4 animate-pulse">
          KSPL
        </div>
        <p className="text-xs font-mono text-zinc-400">Verifying session credentials & tenant authorization...</p>
      </div>
    );
  }

  // View Switcher based on authView
  switch (authView) {
    case 'landing':
      return (
        <PublicLandingPage
          onNavigateToLogin={() => setAuthView('login')}
          onNavigateToRegister={() => setAuthView('register')}
        />
      );

    case 'login':
      return (
        <LoginPage
          onLogin={login}
          onNavigateToRegister={() => setAuthView('register')}
          onNavigateToForgotPassword={() => setAuthView('forgot-password')}
          onNavigateToLanding={() => setAuthView('landing')}
        />
      );

    case 'register':
      return (
        <RegisterPage
          onRegister={register}
          onNavigateToLogin={() => setAuthView('login')}
          onNavigateToLanding={() => setAuthView('landing')}
        />
      );

    case 'forgot-password':
      return (
        <ForgotPasswordPage
          onRequestReset={requestPasswordReset}
          onNavigateToLogin={() => setAuthView('login')}
          onNavigateToResetWithToken={(token) => setAuthView('reset-password', token)}
          onNavigateToLanding={() => setAuthView('landing')}
        />
      );

    case 'reset-password':
      return (
        <ResetPasswordPage
          initialToken={resetTokenParam}
          onResetPassword={resetPassword}
          onNavigateToLogin={() => setAuthView('login')}
          onNavigateToLanding={() => setAuthView('landing')}
        />
      );

    case 'mfa_verification':
      return (
        <MfaVerificationPage
          tempToken={tempMfaToken || ''}
          mfaMethod={tempMfaMethod}
          userEmail={tempMfaUserEmail}
          mfaSetupRequired={tempMfaSetupRequired}
          onVerified={completeMfaLogin}
          onCancel={() => setAuthView('login')}
        />
      );

    case 'app':
    default:
      return <AuthenticatedAppLayout />;
  }
};

export default function App() {
  return (
    <AppProvider>
      <RootRouterContent />
    </AppProvider>
  );
}
