
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Subscriptions from './pages/Subscriptions';
import Intelligence from './pages/Intelligence';
import Budgets from './pages/Budgets';
import Profile from './pages/Profile';
import Auth from './pages/Auth';

import { useAuthStore } from './store/authStore';
import { Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './components/layout/ThemeProvider';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Auth />} />

          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="subscriptions" element={<Subscriptions />} />
            <Route path="intelligence" element={<Intelligence />} />
            <Route path="budgets" element={<Budgets />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
