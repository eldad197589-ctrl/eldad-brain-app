import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { initTabSync } from './store/tabSync'
import { useBrainStore } from './store/brainStore'

import Layout from './components/Layout'
import EmbeddedPage from './pages/EmbeddedPage'

// Initialize cross-tab sync
initTabSync(
  useBrainStore.getState as () => unknown,
  useBrainStore.setState as (v: unknown) => void,
);

// Initialize Supabase sync (loads from cloud DB if configured, falls back to localStorage)
useBrainStore.getState().initializeFromSupabase();

const Dashboard = lazy(() => import('./pages/dashboard'))
const CeoOffice = lazy(() => import('./pages/ceo-office'))
const RobiumHub = lazy(() => import('./pages/robium-hub'))
const FlowchartPage = lazy(() => import('./pages/FlowchartPage'))
const ClientsPage = lazy(() => import('./pages/ClientsPage'))
const ProductsPage = lazy(() => import('./pages/products'))
const FoundersPage = lazy(() => import('./pages/founders'))
const AgreementPage = lazy(() => import('./pages/agreement'))
const CaseHelman = lazy(() => import('./pages/CaseHelman'))
const LetterPage = lazy(() => import('./pages/LetterPage'))
const DocumentsPage = lazy(() => import('./pages/documents'))

const SettingsPage = lazy(() => import('./pages/settings'))
const HobbiesPage = lazy(() => import('./pages/hobbies'))
const ShareableSetlist = lazy(() => import('./pages/hobbies/components/ShareableSetlist'))
const MusicianSignup = lazy(() => import('./pages/hobbies/MusicianSignup'))

// Placeholder for pages we'll build later
const ComingSoon = lazy(() => import('./pages/ComingSoon'))

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
            <Route path="/hub" element={<RobiumHub />} />
            {/* Clients & Cases */}
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/case/helman" element={<CaseHelman />} />
            <Route path="/case/guardian" element={<EmbeddedPage title="תיק גרדיאן — אנריקה" src="/legacy/case-guardian-enrique.html" badge="תיק לקוח" badgeColor="#10b981" />} />
            {/* Robium */}
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/comparison" element={<EmbeddedPage title="ניתוח מתחרים — Robium vs השוק" src="/legacy/robium_comparison.html" badge="אנליזה" badgeColor="#3b82f6" />} />
            <Route path="/agreement" element={<EmbeddedPage title="הסכם מייסדים — רוביום בע״מ" src="/legacy/robium_final_agreement.html" badge="הסכם רשמי" badgeColor="#10b981" />} />
            <Route path="/agreement/review" element={<AgreementPage />} />
            <Route path="/founders" element={<FoundersPage />} />
            <Route path="/incubator" element={<EmbeddedPage title="חממה טכנולוגית — Robium" src="/legacy/robium_incubator_team.html" badge="צוות" badgeColor="#f59e0b" />} />
            {/* Tools */}
            <Route path="/calculator" element={<ComingSoon />} />
            <Route path="/letter" element={<LetterPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/hobbies" element={<HobbiesPage />} />
            {/* Flowcharts */}
            <Route path="/flow/:flowId" element={<FlowchartPage />} />
          </Route>
          {/* Standalone shareable setlist — no sidebar/layout */}
          <Route path="/setlist/:id" element={<ShareableSetlist />} />
          {/* Standalone musician signup — no sidebar/layout */}
          <Route path="/signup/musician" element={<MusicianSignup />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
)

