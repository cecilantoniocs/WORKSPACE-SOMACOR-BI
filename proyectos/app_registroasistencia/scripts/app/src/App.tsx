import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Login from './pages/Login';
import Inicio from './pages/Inicio';
import Home from './pages/Home';
import RegistroAsistencia from './pages/RegistroAsistencia';
import Registrar from './pages/Registrar';
import Consultar from './pages/Consultar';
import Validar from './pages/Validar';
import Admin from './pages/Admin';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout><Inicio /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/horas-extras"
          element={
            <ProtectedRoute>
              <Layout><Home /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/registro-asistencia"
          element={
            <ProtectedRoute rolesPermitidos={['supervisor', 'adc', 'jefatura', 'gerencia', 'admin']}>
              <Layout><RegistroAsistencia /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/registrar"
          element={
            <ProtectedRoute rolesPermitidos={['supervisor', 'adc', 'jefatura', 'gerencia', 'admin']}>
              <Layout><Registrar /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/consultar"
          element={
            <ProtectedRoute>
              <Layout><Consultar /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/validar"
          element={
            <ProtectedRoute rolesPermitidos={['jefatura', 'gerencia', 'admin']}>
              <Layout><Validar /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute rolesPermitidos={['admin']}>
              <Layout><Admin /></Layout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
