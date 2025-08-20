import AdminHeader from '../components/admin/AdminHeader';
import Footer from '../shared/Footer';
import AdminSystemSettings from '../components/admin/AdminSystemSettings';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Admin System Settings Page
const AdminSystemSettingsPage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user || user.role !== 'admin') {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  return (
    <div className="min-h-screen bg-cream">
      <AdminHeader />
      <div className="container mx-auto p-6 mt-14">
        {/* System Settings Panel */}
        <AdminSystemSettings />
      </div>
      <Footer />
    </div>
  );
};

export default AdminSystemSettingsPage;
