import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useBotStore } from '../store/botStore';
import { fetchConversations } from '../services/conversationsApi';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth, loadProfile } = useAuthStore();
  const hydrateMessages = useBotStore(state => state.hydrateMessages);

  useEffect(() => {
    const token = searchParams.get('token');
    const userId = searchParams.get('userId');
    const userName = searchParams.get('userName');
    const userEmail = searchParams.get('userEmail');
    const authError = searchParams.get('error');

    if (token) {
      setAuth(token, {
        id: userId || null,
        name: userName || null,
        email: userEmail || null
      });
      fetchConversations(token)
        .then((messages) => hydrateMessages(messages))
        .catch((error) => console.error('Error loading conversations:', error));

      loadProfile();
      navigate('/dashboard', { replace: true });
      return;
    }

    if (authError) {
      toast.error('No se pudo completar la autenticación con Google');
    }

    navigate('/', { replace: true });
  }, [searchParams, setAuth, loadProfile, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 size={48} className="animate-spin text-blue-400 mx-auto mb-4" />
        <p className="text-xl">Autenticando...</p>
      </div>
    </div>
  );
}
