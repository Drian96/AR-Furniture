import { useState } from 'react';
import Sidebar from '../components/userProfile/Sidebar';
import ProfileInformation from '../components/userProfile/ProfileInformation';
import MyPurchase from '../components/userProfile/MyPurchase';
import MyAddress from '../components/userProfile/MyAddress';
import Security from '../components/userProfile/Security';
import Settings from '../components/userProfile/Settings';
import Header from '../shared/Header';
import Footer from '../shared/Footer';

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
      
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ">
        {/* Mobile Layout - Sidebar on top, content below */}
        <div className="lg:hidden ">
          <div className="mb-6">
            <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
          </div>
          <div className="bg-white rounded-lg p-4 mb-11 shadow-dgreen shadow-xl">
            {renderContent()}
          </div>
        </div>

        {/* Desktop Layout - Sidebar left, content right */}
        <div className="hidden lg:flex gap-6">
          <div className="w-64">
            <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
          </div>
          <div className="flex-1 bg-white rounded-lg p-6 mb-11 shadow-dgreen shadow-xl">
            {renderContent()}
          </div>
        </div>
      </div>

      <Footer />

    </div>
  );
};

export default UserProfile;