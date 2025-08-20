import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminSidebar from '../components/admin/AdminProfileSidebar';
import AdminProfileInformation from '../components/admin/AdminProfileInformation';
import AdminSecurity from '../components/admin/AdminSecurity';
import AdminSettings from '../components/admin/AdminSettings';
import AdminHeader from '../components/admin/AdminHeader';
import Footer from '../shared/Footer';

// Admin profile page component - similar to user profile but with admin features
// TODO: When backend is connected, add authentication check for admin role
const AdminProfile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  // State management for active section
  const [activeSection, setActiveSection] = useState('profile');

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user || !['admin', 'manager', 'staff'].includes(user.role)) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  // Function to render the appropriate content based on active section
  // TODO: When backend is connected, each section will fetch admin-specific data
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'profile':
        return <AdminProfileInformation />;
      case 'security':
        return <AdminSecurity />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminProfileInformation />;
    }
  };

  return (
    <div className="min-h-screen bg-cream">
        <AdminHeader />
        <div className="container mx-auto p-6 mt-14">
            <div className="flex gap-6">
            {/* Sidebar Component */}
            {/* TODO: When backend is ready, pass admin user data as props */}
            <AdminSidebar 
                activeSection={activeSection} 
                setActiveSection={setActiveSection} 
            />
            
                {/* Main Content Area */}
                {/* This area changes based on sidebar selection but sidebar remains visible */}
                <div className="flex-1 bg-white rounded-lg p-8 shadow-sm border border-sage-light">
                    {renderActiveSection()}
                </div>
            </div>
        </div>
        <Footer />
    </div>
  );
};

export default AdminProfile;