import { AuthRoutes } from "@/features/auth/AuthRoutes";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from "./store/auth.store";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(store => store.isAuthenticated());
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth/login" replace />;
}

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/*" element={<AuthRoutes />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              {/* Aquí irá tu DashboardLayout con las rutas privadas */}
              <div>Dashboard — próximamente</div>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
