import { Navigate } from 'react-router-dom';
import { useStore, type TipoUsuario } from '../store/useStore';

interface Props {
  children: React.ReactNode;
  rolesPermitidos?: TipoUsuario[];
}

export default function ProtectedRoute({ children, rolesPermitidos }: Props) {
  const usuarioActivo = useStore(s => s.usuarioActivo);

  if (!usuarioActivo) return <Navigate to="/login" replace />;
  if (rolesPermitidos && !rolesPermitidos.includes(usuarioActivo.tipo)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
