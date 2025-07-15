import { useState } from 'react';
import Sidebar from '../components/userProfile/Sidebar';
import ProfileInformation from '../components/userProfile/ProfileInformation';
import MyPurchase from '../components/userProfile/MyPurchase';
import MyAddress from '../components/userProfile/MyAddress';
import Security from '../components/userProfile/Security';
import Settings from '../components/userProfile/Settings';

const UserProfile = () => {
  const [activeSection, setActiveSection] = useState('profile');

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileInformation />;
      case 'purchases':
        return <MyPurchase />;
      case 'addresses':
        return <MyAddress />;
      case 'security':
        return <Security />;
      case 'settings':
        return <Settings />;
      default:
        return <ProfileInformation />;
    }
  };

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
          <div className="flex-1 bg-white rounded-lg p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;