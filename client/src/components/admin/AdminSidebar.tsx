import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  BarChart3, 
  Eye, 
  Users, 
  UserCog, 
  MessageSquare, 
  Star, 
  FileText, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// Interface for admin sidebar component props
// TODO: When connecting to backend, these props will handle admin navigation state
interface AdminSidebarProps {
  activeSection: string; // Current active section ID
  setActiveSection: (section: string) => void; // Function to change active section
}

const AdminSidebar = ({ activeSection, setActiveSection }: AdminSidebarProps) => {
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false as any);
  // Role-based permissions
  // - admin: access all
  // - manager: no access to user accounts, audit logs, system settings
  // - staff: no access to reports, user accounts, audit logs, system settings
  // Customer should not be here
  const currentRole: 'admin' | 'manager' | 'staff' | 'customer' = (user?.role as any) || 'customer';
  // Admin navigation items configuration
  // TODO: When backend is connected, you can fetch admin permissions to show/hide certain items
  const allItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'stocks', label: 'View Stocks', icon: Eye },
    { id: 'customer', label: 'Customer', icon: Users },
    { id: 'users', label: 'User Accounts', icon: UserCog },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'rates', label: 'Rates & Reviews', icon: Star },
    { id: 'audit', label: 'Audit logs', icon: FileText },
  ];

  const sidebarItems = allItems.filter((item) => {
    if (currentRole === 'admin') return true;
    if (currentRole === 'manager') {
      return !['users', 'audit'].includes(item.id);
    }
    if (currentRole === 'staff') {
      return !['reports', 'users', 'audit'].includes(item.id);
    }
    return false;
  });

  // TODO: When backend is connected, fetch admin data from your Express API
  // Example: const adminData = await fetch('/api/admin/profile')
  const mockAdminData = {
    name: user ? `${user.firstName} ${user.lastName}` : 'Admin User',
    email: user?.email || 'admin@shop.com',
    role: currentRole === 'admin' ? 'Administrator' : currentRole === 'manager' ? 'Manager' : 'Staff'
  };

  // TODO: When backend is ready, implement proper logout functionality
  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="w-64 bg-lgreen rounded-lg p-6 h-fit">
      {/* Admin Profile Section */}
      {/* TODO: When backend is ready, display actual admin avatar from database */}
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-sage-medium rounded-full mx-auto mb-3 flex items-center justify-center">
          <UserCog className="w-10 h-10 text-dgreen" />
        </div>
        {/* Admin Name - TODO: Get from JWT token or admin session */}
        <h3 className="text-dgreen font-semibold">{mockAdminData.name}</h3>
        {/* Admin Email - TODO: Get from authenticated admin data */}
        <p className="text-dgray text-sm">{mockAdminData.email}</p>
        {/* Admin Role Badge */}
        <span className="inline-block bg-dgreen text-cream text-xs px-2 py-1 rounded-full mt-1">
          {mockAdminData.role}
        </span>
      </div>
      
      {/* Navigation Menu */}
      <nav className="space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          // Check if current item is active
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left 
                transition-all duration-200 ease-in-out cursor-pointer
                ${isActive 
                  ? 'bg-dgreen text-cream shadow-md' // Active state: dark green background with cream text
                  : 'text-dgreen hover:bg-sage-medium hover:shadow-sm' // Inactive state: hover effects
                }
              `}
            >
              {/* Icon with consistent sizing */}
              <Icon className={`w-5 h-5 ${isActive ? 'text-cream' : 'text-dgreen'}`} />
              {/* Label text */}
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
        
        {/* Logout Button */}
        {/* TODO: When backend is ready, implement proper admin logout */}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left 
                     text-red-600 hover:bg-red-50 hover:shadow-sm transition-all duration-200 ease-in-out"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </nav>
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-dgreen mb-2">Logout</h3>
              <p className="text-dgray">Are you sure you want to logout? You will be redirected to the landing page.</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2 border border-sage-light text-dgray rounded-lg hover:bg-sage-light transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSidebar;