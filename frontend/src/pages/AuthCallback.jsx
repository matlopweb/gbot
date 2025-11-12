import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      // Guardar el token directamente sin decodificar para evitar incompatibilidades de base64url
      setAuth(token, {});
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  }, [searchParams, setAuth, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 size={48} className="animate-spin text-blue-400 mx-auto mb-4" />
        <p className="text-xl">Autenticando...</p>
      </div>
    </div>
  );
}
