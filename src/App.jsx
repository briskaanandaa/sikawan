import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import LoginPage from "@/pages/login/page";
import DashboardPage from "@/pages/dashboard/page";
import BlogPage from "@/pages/blog/page";
import BlogCreatePage from "@/pages/blog/create";
import KatalogPage from "@/pages/katalog/page";
import KatalogCreate from "@/pages/katalog/create";
import OrderPage from "@/pages/order/page";
import OrderCreate from "@/pages/order/create";
import CashflowPage from "@/pages/cashflow/page";
import CashflowCreate from "@/pages/cashflow/create";
import SettingsPage from "@/pages/settings/page";

import Layout from "@/components/layout";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes — semua di dalam ProtectedRoute */}
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />

              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/create" element={<BlogCreatePage />} />
              <Route path="/blog/edit/:id" element={<BlogCreatePage />} />

              <Route path="/katalog" element={<KatalogPage />} />
              <Route path="/katalog/create" element={<KatalogCreate />} />
              <Route path="/katalog/edit/:id" element={<KatalogCreate />} />

              <Route path="/order" element={<OrderPage />} />
              <Route path="/order/create" element={<OrderCreate />} />
              <Route path="/order/edit/:id" element={<OrderCreate />} />

              <Route path="/cashflow" element={<CashflowPage />} />
              <Route path="/cashflow/create" element={<CashflowCreate />} />

              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
