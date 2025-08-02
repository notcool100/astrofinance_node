// Re-export the useAuth hook from the AuthContext
import { useAuth as useAuthContext } from '@/contexts/AuthContext';

export const useAuth = useAuthContext;