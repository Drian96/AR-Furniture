import AdminHeader from '../components/admin/AdminHeader';
import Footer from '../shared/Footer';
import AdminSystemSettings from '../components/admin/AdminSystemSettings';

// Admin System Settings Page
const AdminSystemSettingsPage = () => {
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
