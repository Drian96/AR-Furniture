import { User, Package, MapPin, Shield, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// Interface for sidebar component props
// TODO: When connecting to backend, these props will handle user navigation state
interface SidebarProps {
  activeSection: string; // Current active section ID
  setActiveSection: (section: string) => void; // Function to change active section
}

const Sidebar = ({ activeSection, setActiveSection }: SidebarProps) => {
  const { user } = useAuth();

  // Navigation items configuration
  // TODO: When backend is connected, you can fetch user permissions to show/hide certain items
  const sidebarItems = [
    { id: 'profile', label: 'Profile Information', icon: User },
    { id: 'purchases', label: 'My Purchase', icon: Package },
    { id: 'addresses', label: 'My Address', icon: MapPin },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  // Fallbacks for user display if not loaded yet
  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : '...';
  const displayEmail = user?.email || '';

  return (
    <div className="bg-lgreen rounded-lg p-4 lg:p-6 h-fit">
      {/* User Profile Section - Responsive */}
      <div className="text-center mb-4 lg:mb-6">
        <div className="w-16 h-16 lg:w-20 lg:h-20 bg-sage-medium rounded-full mx-auto mb-2 lg:mb-3 flex items-center justify-center">
          <User className="w-8 h-8 lg:w-10 lg:h-10 text-dgreen" />
        </div>
        {/* User Name - from auth context */}
        <h3 className="text-dgreen font-semibold text-sm lg:text-base">{displayName}</h3>
        {/* User Email - from auth context */}
        <p className="text-dgray text-xs lg:text-sm">{displayEmail}</p>
      </div>
      
      {/* Navigation Menu - Mobile: horizontal, Desktop: vertical */}
      <nav className="flex justify-center lg:block space-x-2 lg:space-x-0 lg:space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          // Check if current item is active
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`
                flex items-center justify-center lg:justify-start
                w-12 h-12 lg:w-full lg:h-auto lg:space-x-3 lg:px-4 lg:py-3
                rounded-lg text-left transition-all duration-200 ease-in-out cursor-pointer
                ${isActive 
                  ? 'bg-dgreen text-cream shadow-md' // Active state: dark green background with cream text
                  : 'text-dgreen hover:bg-sage-medium hover:shadow-sm' // Inactive state: hover effects
                }
              `}
              title={item.label} // Tooltip for mobile accessibility
            >
              {/* Icon with responsive sizing */}
              <Icon className={`w-6 h-6 lg:w-5 lg:h-5 ${isActive ? 'text-cream' : 'text-dgreen'}`} />
              {/* Label text - hidden on mobile, visible on desktop */}
              <span className="hidden lg:block text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;