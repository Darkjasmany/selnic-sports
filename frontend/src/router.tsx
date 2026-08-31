import { AuthRoutes } from "@/features/auth/AuthRoutes";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import UsersPage from "./features/admin/pages/UsersPage";
import CategoriesPage from "./features/categories/pages/CategoriesPage";
import DisciplinesPage from "./features/disciplines/pages/DisciplinesPage";
import MatchesPage from "./features/matches/pages/MatchesPage";
import MatchFlowPage from "./features/matches/pages/MatchFlowPage";
import BulkCarnetPage from "./features/players/pages/BulkCarnetPage";
import PlayerCarnetPage from "./features/players/pages/PlayerCarnetPage";
import PlayerReportPage from "./features/players/pages/PlayerReportPage";
import PlayersPage from "./features/players/pages/PlayersPage";
import TeamsPage from "./features/teams/pages/TeamsPage";
import TournamentCreatePage from "./features/tournaments/pages/TournamentCreatePage";
import TournamentDetailPage from "./features/tournaments/pages/TournamentDetailPage";
import TournamentsPage from "./features/tournaments/pages/TournamentsPage";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import { useAuthStore } from "./store/auth.store";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated());
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth/login" replace />;
}

export default function Router() {
  return (
    <BrowserRouter basename="/selnic-sports">
      <Routes>
        <Route path="/auth/*" element={<AuthRoutes />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          {/* Aquí irán las rutas de cada módulo cuando los construyamos */}
          <Route path="teams" element={<TeamsPage />} />
          <Route path="players" element={<PlayersPage />} />
          <Route path="players/:id/report" element={<PlayerReportPage />} />
          <Route path="players/:id/carnet" element={<PlayerCarnetPage />} />
          <Route path="players/bulk-carnets" element={<BulkCarnetPage />} />
          <Route path="matches" element={<MatchesPage />} />
          <Route path="matches/:id/flow" element={<MatchFlowPage />} />
          <Route path="disciplines" element={<DisciplinesPage />} />
          <Route path="tournaments" element={<TournamentsPage />} />
          <Route path="tournaments/create" element={<TournamentCreatePage />} />
          <Route path="tournaments/:id" element={<TournamentDetailPage />} />
          <Route path="admin/categories" element={<CategoriesPage />} />
          <Route path="admin/users" element={<UsersPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
