import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import {
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  SignIn,
  SignUp,
  AuthenticateWithRedirectCallback,
} from '@clerk/clerk-react';
import { AppShell } from './components/layout/AppShell.tsx';
import { DashboardPage } from './components/dashboard/DashboardPage.tsx';
import { FamiliesPage } from './components/families/FamiliesPage.tsx';
import { FamilyDetailPage } from './components/families/FamilyDetailPage.tsx';
import { RequirementsPage } from './components/requirements/RequirementsPage.tsx';
import { TraceabilityPage } from './components/requirements/TraceabilityPage.tsx';
import { ArchitecturePage } from './components/architecture/ArchitecturePage.tsx';
import { ArtifactsPage } from './components/artifacts/ArtifactsPage.tsx';
import { VerificationPage } from './components/verification/VerificationPage.tsx';
import { BomPage } from './components/bom/BomPage.tsx';
import { PlanningPage } from './components/planning/PlanningPage.tsx';
import { ChangesPage } from './components/changes/ChangesPage.tsx';
import { ChangeDetailPage } from './components/changes/ChangeDetailPage.tsx';
import { ReleasesPage } from './components/releases/ReleasesPage.tsx';
import { ReleaseDetailPage } from './components/releases/ReleaseDetailPage.tsx';
import { ReviewsPage } from './components/reviews/ReviewsPage.tsx';
import { ReviewDetailPage } from './components/reviews/ReviewDetailPage.tsx';
import { SettingsPage } from './components/settings/SettingsPage.tsx';
import { NotFoundPage } from './components/NotFoundPage.tsx';

function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <SignIn routing="path" path="/sign-in" />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <SignUp routing="path" path="/sign-up" />
    </div>
  );
}

function AuthGate() {
  return (
    <>
      <SignedIn>
        <AppShell />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

const router = createBrowserRouter([
  { path: '/sign-in/*', element: <SignInPage /> },
  { path: '/sign-up/*', element: <SignUpPage /> },
  { path: '/sso-callback', element: <AuthenticateWithRedirectCallback /> },
  {
    path: '/',
    element: <AuthGate />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'families', element: <FamiliesPage /> },
      { path: 'families/:familyId', element: <FamilyDetailPage /> },
      { path: 'requirements', element: <RequirementsPage /> },
      { path: 'requirements/traceability', element: <TraceabilityPage /> },
      { path: 'architecture', element: <ArchitecturePage /> },
      { path: 'artifacts', element: <ArtifactsPage /> },
      { path: 'verification', element: <VerificationPage /> },
      { path: 'bom', element: <BomPage /> },
      { path: 'planning', element: <PlanningPage /> },
      { path: 'changes', element: <ChangesPage /> },
      { path: 'changes/:changeId', element: <ChangeDetailPage /> },
      { path: 'releases', element: <ReleasesPage /> },
      { path: 'releases/:releaseId', element: <ReleaseDetailPage /> },
      { path: 'reviews', element: <ReviewsPage /> },
      { path: 'reviews/:reviewId', element: <ReviewDetailPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
