import { User, Package, MapPin, Shield, Settings as SettingsIcon } from 'lucide-react';

// Interface for sidebar component props
// TODO: When connecting to backend, these props will handle user navigation state
interface SidebarProps {
  activeSection: string; // Current active section ID
  setActiveSection: (section: string) => void; // Function to change active section
}

const Sidebar = ({ activeSection, setActiveSection }: SidebarProps) => {
  // Navigation items configuration
  // TODO: When backend is connected, you can fetch user permissions to show/hide certain items
  const sidebarItems = [
    { id: 'profile', label: 'Profile Information', icon: User },
    { id: 'purchases', label: 'My Purchase', icon: Package },
    { id: 'addresses', label: 'My Address', icon: MapPin },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  // TODO: When backend is connected, fetch user data from your Express API
  // Example: const userData = await fetch('/api/user/profile')
  const mockUserData = {
    name: "John Doe", // TODO: Replace with actual user name from backend
    email: "john.doe@example.com" // TODO: Replace with actual user email from auth
  };

  return (
    <div className="w-64 bg-lgreen rounded-lg p-6 h-fit">
      {/* User Profile Section */}
      {/* TODO: When backend is ready, display actual user avatar from database */}
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-sage-medium rounded-full mx-auto mb-3 flex items-center justify-center">
          <User className="w-10 h-10 text-dgreen" />
        </div>
        {/* User Name - TODO: Get from JWT token or user session */}
        <h3 className="text-dgreen font-semibold">{mockUserData.name}</h3>
        {/* User Email - TODO: Get from authenticated user data */}
        <p className="text-dgray text-sm">{mockUserData.email}</p>
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
                transition-all duration-200 ease-in-out
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
      </nav>
    </div>
  );
};

export default Sidebar;