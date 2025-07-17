import { useState } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminDashboardMain from '../components/admin/AdminDashboardMain';
import AdminOrders from '../components/admin/AdminOrders';
import AdminReports from '../components/admin/AdminReports';
import AdminViewStocks from '../components/admin/AdminViewStocks';
import AdminCustomer from '../components/admin/AdminCustomer';
import AdminUserAccounts from '../components/admin/AdminUserAccounts';
import AdminMessages from '../components/admin/AdminMessages';
import AdminRatesReviews from '../components/admin/AdminRatesReviews';
import AdminAuditLogs from '../components/admin/AdminAuditLogs';
import AdminHeader from '../components/admin/AdminHeader';
import Footer from '../shared/Footer';

// Main admin dashboard page component
// TODO: When backend is connected, add authentication check for admin role
const AdminDashboard = () => {
  // State management for active section
  // TODO: Consider using React Router for URL-based navigation when backend is ready
  const [activeSection, setActiveSection] = useState('dashboard');

  // Function to render the appropriate content based on active section
  // TODO: When backend is connected, each section will fetch its own data
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <AdminDashboardMain />;
      case 'orders':
        return <AdminOrders />;
      case 'reports':
        return <AdminReports />;
      case 'stocks':
        return <AdminViewStocks />;
      case 'customer':
        return <AdminCustomer />;
      case 'users':
        return <AdminUserAccounts />;
      case 'messages':
        return <AdminMessages />;
      case 'rates':
        return <AdminRatesReviews />;
      case 'audit':
        return <AdminAuditLogs />;
      default:
        return <AdminDashboardMain />;
    }
  };

  return (
    <div className="min-h-screen bg-cream">
        <AdminHeader />
      <div className="container mx-auto p-6">
        <div className="flex gap-6">
          {/* Sidebar Component */}
          {/* TODO: When backend is ready, pass admin user data as props */}
          <AdminSidebar 
            activeSection={activeSection} 
            setActiveSection={setActiveSection} 
          />
          
          {/* Main Content Area */}
          {/* This area changes based on sidebar selection but sidebar remains visible */}
          <div className="flex-1">
            {renderActiveSection()}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminDashboard;