import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Skeleton } from './ui/skeleton';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h2>
          <p className="text-red-700 mb-4">You don't have permission to access this page.</p>
          <p className="text-red-600">Only administrators can access this area.</p>
        </div>
      </div>
    );
  }

  return children;
}
