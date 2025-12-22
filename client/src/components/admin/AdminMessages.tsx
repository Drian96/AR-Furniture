import { MessageSquare, ExternalLink } from 'lucide-react';

// Messages management component for admin
// Redirects to Tawk.to dashboard for managing customer messages
const AdminMessages = () => {
  const handleOpenTawkDashboard = () => {
    window.open('https://dashboard.tawk.to/#/dashboard/6948d8641f0ade19740a2992', '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-dgreen">Messages</h1>
        <p className="text-dgray mt-1">Manage customer inquiries and communications</p>
      </div>

      {/* Tawk.to Dashboard Access */}
      <div className="bg-white rounded-lg p-8 shadow-sm border border-sage-light">
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-20 h-20 bg-sage-light rounded-full flex items-center justify-center">
            <MessageSquare className="w-10 h-10 text-dgreen" />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-dgreen mb-2">Customer Messages</h2>
            <p className="text-dgray max-w-md">
              All customer messages and chat conversations are managed through the Tawk.to dashboard.
              Click the button below to access your chat dashboard.
            </p>
          </div>

          <button
            onClick={handleOpenTawkDashboard}
            className="bg-dgreen text-cream px-6 py-3 rounded-lg hover:bg-lgreen transition-colors font-semibold flex items-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
          >
            <MessageSquare className="w-5 h-5" />
            Open Tawk.to Dashboard
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminMessages;