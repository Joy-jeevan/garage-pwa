import { useEffect } from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { useAuthStore } from "./stores/auth";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import CustomerDetail from "./pages/CustomerDetail";
import Vehicles from "./pages/Vehicles";
import VehicleDetail from "./pages/VehicleDetail";
import JobCards from "./pages/JobCards";
import JobCardDetail from "./pages/JobCardDetail";
import Invoices from "./pages/Invoices";
import InvoiceDetail from "./pages/InvoiceDetail";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore();
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-400">
        Loading...
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation();
  const active =
    to === "/"
      ? location.pathname === "/"
      : location.pathname === to || location.pathname.startsWith(to + "/");
  return (
    <Link
      to={to}
      className={`text-sm px-3 py-1.5 rounded-md transition whitespace-nowrap ${
        active
          ? "bg-slate-800 text-slate-100"
          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
      }`}
    >
      {children}
    </Link>
  );
}

function App() {
  const { user, isLoading, loadUser, logout } = useAuthStore();
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <div className="min-h-screen flex flex-col">
      {!isAuthPage && (
        <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                to="/"
                className="text-lg font-semibold tracking-tight shrink-0"
              >
                Garage Manager
              </Link>
              {user && (
                <nav className="hidden md:flex items-center gap-1 overflow-x-auto">
                  <NavLink to="/">Dashboard</NavLink>
                  <NavLink to="/job-cards">Jobs</NavLink>
                  <NavLink to="/customers">Customers</NavLink>
                  <NavLink to="/vehicles">Vehicles</NavLink>
                  <NavLink to="/invoices">Invoices</NavLink>
                </nav>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {!isLoading && user ? (
                <>
                  <span className="text-sm text-slate-400 hidden lg:inline">
                    {user.fullName}{" "}
                    <span className="text-slate-600">({user.role})</span>
                  </span>
                  <button
                    onClick={logout}
                    className="rounded-md border border-slate-700 px-3 py-1.5 text-sm hover:bg-slate-800 transition"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                !isLoading && (
                  <Link
                    to="/login"
                    className="rounded-md bg-sky-600 px-4 py-1.5 text-sm font-medium hover:bg-sky-500 transition"
                  >
                    Sign in
                  </Link>
                )
              )}
            </div>
          </div>
          {user && (
            <nav className="md:hidden flex border-t border-slate-800 px-2 py-1 gap-1 overflow-x-auto">
              <NavLink to="/">Home</NavLink>
              <NavLink to="/job-cards">Jobs</NavLink>
              <NavLink to="/customers">Customers</NavLink>
              <NavLink to="/vehicles">Vehicles</NavLink>
              <NavLink to="/invoices">Invoices</NavLink>
            </nav>
          )}
        </header>
      )}

      <main
        className={`flex-1 mx-auto w-full max-w-7xl px-4 ${
          isAuthPage ? "py-0" : "py-6"
        }`}
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <Customers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers/:id"
            element={
              <ProtectedRoute>
                <CustomerDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehicles"
            element={
              <ProtectedRoute>
                <Vehicles />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehicles/:id"
            element={
              <ProtectedRoute>
                <VehicleDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/job-cards"
            element={
              <ProtectedRoute>
                <JobCards />
              </ProtectedRoute>
            }
          />
          <Route
            path="/job-cards/:id"
            element={
              <ProtectedRoute>
                <JobCardDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoices"
            element={
              <ProtectedRoute>
                <Invoices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoices/:id"
            element={
              <ProtectedRoute>
                <InvoiceDetail />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
