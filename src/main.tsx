/* ============================================
   FILE: main.tsx
   PURPOSE: App root — routes, providers, lazy loading
   DEPENDENCIES: react, react-dom, react-router-dom
   EXPORTS: None
   ============================================ */
// #region Imports

import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { initTabSync } from './store/tabSync'

import { useBrainStore } from './store/brainStore'

import Layout from './components/Layout'
import EmbeddedPage from './pages/EmbeddedPage'

// Initialize cross-tab sync

// #endregion

initTabSync(
  useBrainStore.getState as () => unknown,
  useBrainStore.setState as (v: unknown) => void,
);

// Initialize Supabase sync (loads from cloud DB if configured, falls back to localStorage)
useBrainStore.getState().initializeFromSupabase();

// Initialize Process Registry — single source of truth for all processes
import { seedAllProcesses } from './system/processSeed';
import { initializeWorkSpineEnvironment } from './work-spine/runtime/work-spine-bootstrap';

seedAllProcesses();
initializeWorkSpineEnvironment();

const Dashboard = lazy(() => import('./pages/dashboard'))
const CeoOffice = lazy(() => import('./pages/ceo-office'))
const RobiumHub = lazy(() => import('./pages/robium-hub'))
const FlowchartPageWrapper = lazy(() => import('./pages/flowchart/FlowchartPageWrapper'))
const ClientsPage = lazy(() => import('./pages/ClientsPage'))
const ClientProfile = lazy(() => import('./pages/ClientProfile'))
const ProductsPage = lazy(() => import('./pages/products'))
const FoundersPage = lazy(() => import('./pages/founders'))
const AgreementPage = lazy(() => import('./pages/agreement'))
const AgreementDiffPage = lazy(() => import('./pages/agreement/AgreementDiffPage'))
const CaseHelman = lazy(() => import('./pages/CaseHelman'))
const LetterPage = lazy(() => import('./pages/LetterPage'))
const DocumentsPage = lazy(() => import('./pages/documents'))

const SettingsPage = lazy(() => import('./pages/settings'))
const HobbiesPage = lazy(() => import('./pages/hobbies'))
const ShareableSetlist = lazy(() => import('./pages/hobbies/components/ShareableSetlist'))
const MusicianSignup = lazy(() => import('./pages/hobbies/MusicianSignup'))

const ComparisonPage = lazy(() => import('./pages/comparison/ComparisonPage'))
const QuotesGeneratorPage = lazy(() => import('./pages/quotes-generator/QuotesGeneratorPage'))
const PricingManagerPage = lazy(() => import('./pages/ceo-office/PricingManagerPage'))
const ClientOnboardingPage = lazy(() => import('./pages/client-onboarding/ClientOnboardingPage'))
const PhasePoA = lazy(() => import('./pages/client-onboarding/PhasePoA'))
const PhaseRegistrar = lazy(() => import('./pages/client-onboarding/PhaseRegistrar'))
const PhaseBank = lazy(() => import('./pages/client-onboarding/PhaseBank'))
const ClientPortal = lazy(() => import('./pages/portal/ClientPortal'))
const LeadsManagerPage = lazy(() => import('./pages/leads/LeadsManagerPage'))
const MessagingPage = lazy(() => import('./pages/messaging/MessagingPage'))
const PesachCardPage = lazy(() => import('./pages/messaging/PesachCardPage'))
const KirillDisputePage = lazy(() => import('./pages/founders/KirillDisputePage'))
const PesachExodusHero = lazy(() => import('./pages/messaging/PesachExodusHero'))
const IncubatorPage = lazy(() => import('./pages/incubator/IncubatorPage'))
const IncubatorAgreementsPage = lazy(() => import('./pages/incubator-agreements/IncubatorAgreementsPage'))
const CaseViewPage = lazy(() => import('./pages/case-view/CaseViewPage'))
const DocumentChangeAgentPage = lazy(() => import('./pages/document-change-agent/DocumentChangeAgentPage'))
const RobiumClientHub = lazy(() => import('./pages/clients/RobiumClientHub'))
const AccountingCoreDashboardWorkspace = lazy(() => import('./accounting-core/ui/components/accounting-core-dashboard-workspace'))
const TodayControlBoard = lazy(() => import('./work-spine/ui/TodayControlBoard'))

// Placeholder for pages we'll build later
const ComingSoon = lazy(() => import('./pages/ComingSoon'))

// Personal & Home
const PaymentsPage = lazy(() => import('./pages/personal/payments/PaymentsPage'))

function Loader() {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        width: 40, height: 40,
        border: '3px solid rgba(148,163,184,0.15)',
        borderTop: '3px solid #c9a84c',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/ceo" element={<CeoOffice />} />
            <Route path="/work-spine" element={<TodayControlBoard />} />
            <Route path="/hub" element={<RobiumHub />} />
            {/* Clients & Cases */}
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/clients/robium" element={<RobiumClientHub />} />
            <Route path="/clients/:id" element={<ClientProfile />} />
            <Route path="/case/helman" element={<CaseHelman />} />
            <Route path="/case/:caseId" element={<CaseViewPage />} />
            <Route path="/case/guardian" element={<EmbeddedPage title="תיק גרדיאן — אנריקה" src="/legacy/case-guardian-enrique.html" badge="תיק לקוח" badgeColor="#10b981" />} />
            {/* Robium */}
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/comparison" element={<ComparisonPage />} />
            <Route path="/quotes-generator" element={<QuotesGeneratorPage />} />
            <Route path="/pricing-manager" element={<PricingManagerPage />} />
            <Route path="/onboarding" element={<ClientOnboardingPage />} />
            <Route path="/poa" element={<PhasePoA />} />
            <Route path="/registrar" element={<PhaseRegistrar />} />
            <Route path="/bank" element={<PhaseBank />} />
            <Route path="/leads" element={<LeadsManagerPage />} />
            <Route path="/messaging" element={<MessagingPage />} />
            <Route path="/messaging/pesach" element={<PesachCardPage />} />
            <Route path="/agreement" element={<EmbeddedPage title="טיוטת הסכם לדיון — פגישת 25/03" src="/legacy/robium_final_agreement.html" badge="בדיון" badgeColor="#3b82f6" />} />
            <Route path="/agreement/original" element={<EmbeddedPage title="הסכם מקורי (3.3.26) — היסטורי" src="/legacy/robium_agreement_original.html" badge="מקור (33%)" badgeColor="#ef4444" />} />
            <Route path="/agreement/legacy" element={<EmbeddedPage title="טיוטה מעודכנת (11/03/26) — ROBIUM L.T.D" src="/legacy/robium_agreement_updated.html" badge="טיוטה ב׳" badgeColor="#f59e0b" />} />
            <Route path="/agreement/diff" element={<AgreementDiffPage />} />
            <Route path="/document-change-agent" element={<DocumentChangeAgentPage />} />
            <Route path="/agreement/review" element={<AgreementPage />} />
            <Route path="/founders" element={<FoundersPage />} />
            <Route path="/founders/kirill-dispute" element={<KirillDisputePage />} />
            <Route path="/incubator" element={<IncubatorPage />} />
            <Route path="/incubator/agreements" element={<IncubatorAgreementsPage />} />
            <Route path="/incubator/employment-agreement" element={<EmbeddedPage title="הסכם העסקה — עובד חממה" src="/legacy/employment_agreement.html" badge="טמפלייט" badgeColor="#10b981" />} />
            <Route path="/incubator/esop-agreement" element={<EmbeddedPage title="הסכם הענקת אופציות — ESOP" src="/legacy/esop_grant_agreement.html" badge="טמפלייט" badgeColor="#7c3aed" />} />
            {/* Tools */}
            <Route path="/calculator" element={<ComingSoon />} />
            <Route path="/letter" element={<LetterPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/hobbies" element={<HobbiesPage />} />
            {/* Flowcharts */}
            <Route path="/flow/:flowId" element={<FlowchartPageWrapper />} />
            {/* Personal */}
            <Route path="/personal/payments" element={<PaymentsPage />} />
            {/* Accounting Core Dashboard Shell */}
            <Route path="/accounting-core" element={<AccountingCoreDashboardWorkspace />} />
          </Route>
          {/* External Client Portal (No Sidebar) */}
          <Route path="/portal/:token" element={<ClientPortal />} />
          {/* Standalone shareable setlist — no sidebar/layout */}
          <Route path="/setlist/:id" element={<ShareableSetlist />} />
          {/* Standalone musician signup — no sidebar/layout */}
          <Route path="/signup/musician" element={<MusicianSignup />} />
          {/* Standalone Pesach Exodus experience — fullscreen, no layout */}
          <Route path="/exodus" element={<PesachExodusHero />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
)

