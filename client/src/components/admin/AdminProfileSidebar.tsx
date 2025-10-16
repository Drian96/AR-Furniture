import {
  User, // For Profile Information
  Shield, // For Security
  Settings, // For Settings
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// Interface for admin sidebar component props
interface AdminSidebarProps {
  activeSection: string; // Current active section ID
  setActiveSection: (section: string) => void; // Function to change active section
}

const AdminProfileSidebar = ({ activeSection, setActiveSection }: AdminSidebarProps) => {
  const { user, logout } = useAuth();
  // Admin navigation items configuration tailored for AdminProfile sections
  const role = sessionStorage.getItem('lastLoginRole');
  const isAdmin = role === 'admin';
  const sidebarItems = [
    { id: 'profile', label: 'Profile Information', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    // Settings only for admin
    ...(isAdmin ? [{ id: 'settings', label: 'Settings', icon: Settings }] : []),
  ];

  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : 'User';
  const displayRole = user?.role === 'admin' ? 'Administrator' : (user?.role || 'Staff');

  const handleLogout = () => { logout(); };

  return (
    <div className="w-64 bg-lgreen rounded-lg p-6 h-fit">
      {/* Admin Profile Section */}
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-sage-medium rounded-full mx-auto mb-3 flex items-center justify-center">
          {/* Changed icon from UserCog to User for a personal profile feel */}
          <User className="w-10 h-10 text-dgreen" />
        </div>
        <h3 className="text-dgreen font-semibold">{displayName}</h3>
        <p className="text-dgray text-sm">{user?.email || ''}</p>
        {/* Admin Role Badge */}
        <span className="inline-block bg-dgreen text-cream text-xs px-2 py-1 rounded-full mt-1">
          {displayRole}
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
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left
                     text-red-600 hover:bg-red-50 hover:shadow-sm transition-all duration-200 ease-in-out cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </nav>
    </div>
  );
};

export default AdminProfileSidebar;
