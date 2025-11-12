import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    const authError = searchParams.get('error');

    if (token) {
      setAuth(token, {});
      navigate('/dashboard', { replace: true });
      return;
    }

    if (authError) {
      toast.error('No se pudo completar la autenticación con Google');
    }

    navigate('/', { replace: true });
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
