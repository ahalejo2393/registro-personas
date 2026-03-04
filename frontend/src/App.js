import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AppNavbar from './components/common/Navbar';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PersonasList from './pages/PersonasList';
import PersonaForm from './pages/PersonaForm';
import PersonaDetail from './pages/PersonaDetail';
import Dependencias from './pages/Dependencias';
import Usuarios from './pages/Usuarios';

function Layout({ children }) {
  return (
    <>
      <AppNavbar />
      <div className="pb-4">{children}</div>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/personas" element={<ProtectedRoute><Layout><PersonasList /></Layout></ProtectedRoute>} />
          <Route path="/personas/nuevo" element={<ProtectedRoute><Layout><PersonaForm /></Layout></ProtectedRoute>} />
          <Route path="/personas/:id" element={<ProtectedRoute><Layout><PersonaDetail /></Layout></ProtectedRoute>} />
          <Route path="/personas/:id/editar" element={<ProtectedRoute><Layout><PersonaForm /></Layout></ProtectedRoute>} />
          <Route path="/dependencias" element={<ProtectedRoute adminOnly><Layout><Dependencias /></Layout></ProtectedRoute>} />
          <Route path="/usuarios" element={<ProtectedRoute adminOnly><Layout><Usuarios /></Layout></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/personas" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
