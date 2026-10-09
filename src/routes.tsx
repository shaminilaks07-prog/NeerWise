import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import BudgetPage from './features/budget/BudgetPage';
import ChallengesPage from './features/challenges/ChallengesPage';
import DetectivePage from './features/detective/DetectivePage';
import HistoryPage from './features/history/HistoryPage';
import MethodologyPage from './features/info/MethodologyPage';
import PrivacyPage from './features/info/PrivacyPage';
import TermsPage from './features/info/TermsPage';
import OverviewPage from './features/overview/OverviewPage';
import SettingsPage from './features/settings/SettingsPage';

/** Single route registry. Add new pages here and in navigation.ts. */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<OverviewPage />} />
        <Route path="budget" element={<BudgetPage />} />
        <Route path="detective" element={<DetectivePage />} />
        <Route path="challenges" element={<ChallengesPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="methodology" element={<MethodologyPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="terms" element={<TermsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
