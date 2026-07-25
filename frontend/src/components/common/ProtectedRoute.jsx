import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from '../ui/Loader';

export default function ProtectedRoute({ children, requireAdmin = false, requireApproved = false }) {
  const { isAuthenticated, isAdmin, isApproved, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireApproved && !isApproved && !isAdmin) {
    return (
      <div className="page-container">
        <div className="content-container flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-6">
            <span className="text-4xl">⏳</span>
          </div>
          <h2 className="text-2xl font-display font-bold text-dark-900 dark:text-white mb-2">
            Registration Pending
          </h2>
          <p className="text-dark-500 dark:text-dark-400 max-w-md">
            Your registration is being reviewed by the Mess Secretary. You'll receive access once approved.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
