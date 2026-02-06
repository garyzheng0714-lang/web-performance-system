import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { theme } from './theme';
import { AppLayout } from './components/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Objectives } from './pages/Objectives';
import { Approvals } from './pages/Approvals';
import { Completions } from './pages/Completions';
import { Scoring } from './pages/Scoring';
import { Admin } from './pages/Admin';
import { NotFound } from './pages/NotFound';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { loadProfile } from './slices/authSlice';

function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </ProtectedRoute>
  );
}

export function App() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);

  useEffect(() => {
    if (token) {
      dispatch(loadProfile());
    }
  }, [dispatch, token]);

  return (
    <ConfigProvider theme={theme}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/objectives" element={<Objectives />} />
          <Route path="/approvals" element={<Approvals />} />
          <Route path="/completions" element={<Completions />} />
          <Route path="/scoring" element={<Scoring />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ConfigProvider>
  );
}
