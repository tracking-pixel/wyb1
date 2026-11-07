import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { trackingService } from './services/tracking';

// Layouts
import { AppLayout } from './components/layout/AppLayout';
import { DebugPanel } from './components/tracking/DebugPanel';

// Features
import { QuizPage } from './features/quiz/QuizPage';
import { AnalyzingPage } from './features/quiz/AnalyzingPage';
import { EmailCapturePage } from './features/quiz/EmailCapturePage';
import { ResultPage } from './features/quiz/ResultPage';
import { PaywallPage } from './features/paywall/PaywallPage';
import { CheckoutPage } from './features/checkout/CheckoutPage';
import { OfferPage } from './features/offers/OfferPage';
import { CreateAccountPage } from './features/account/CreateAccountPage';
import { OnboardingPage } from './features/account/OnboardingPage';
import { LoginPage } from './features/account/LoginPage';

// App Tabs v2
import { HoyTab } from './features/app/HoyTab';
import { EntrenarTab } from './features/app/EntrenarTab';
import { CaminoTab } from './features/app/CaminoTab';
import { LogrosTab } from './features/app/LogrosTab';
import { PerfilTab } from './features/app/PerfilTab';
import { AssetStudioPage } from './features/admin/AssetStudioPage';

export default function App() {
  useEffect(() => {
    // Initialize attribution and dataLayer tracking on first mount
    trackingService.init();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Entry redirect */}
        <Route path="/" element={<Navigate to="/quiz/1" replace />} />

        {/* 1. Quiz funnel */}
        <Route path="/quiz/:step" element={<QuizPage />} />
        <Route path="/analizando" element={<AnalyzingPage />} />
        <Route path="/email" element={<EmailCapturePage />} />
        <Route path="/resultado" element={<ResultPage />} />

        {/* 2. Paywall */}
        <Route path="/planes" element={<PaywallPage />} />

        {/* 3. Checkout */}
        <Route path="/checkout" element={<CheckoutPage />} />

        {/* 4. One-Click Funnel Offers */}
        <Route path="/oferta/:slug" element={<OfferPage />} />

        {/* 5. Account & Onboarding */}
        <Route path="/crear-cuenta" element={<CreateAccountPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* 6. Main App with Bottom Navigation (5 Tabs) */}
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Navigate to="/app/hoy" replace />} />
          <Route path="hoy" element={<HoyTab />} />
          <Route path="entrenar" element={<EntrenarTab />} />
          <Route path="camino" element={<CaminoTab />} />
          <Route path="logros" element={<LogrosTab />} />
          <Route path="perfil" element={<PerfilTab />} />

          {/* Compatibility redirects for legacy tabs */}
          <Route path="entrenos" element={<Navigate to="/app/entrenar" replace />} />
          <Route path="progreso" element={<Navigate to="/app/perfil" replace />} />
          <Route path="planes" element={<Navigate to="/app/perfil" replace />} />
          <Route path="cuenta" element={<Navigate to="/app/perfil" replace />} />
        </Route>

        {/* 7. AI Asset Studio (Admin only via ?admin=1) */}
        <Route path="/admin/assets" element={<AssetStudioPage />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/quiz/1" replace />} />
      </Routes>

      {/* Real-time Tracking & DataLayer Debug Panel */}
      <DebugPanel />
    </BrowserRouter>
  );
}
