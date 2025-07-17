import { useState } from 'react';
import { Search, Filter, Calendar, User, Activity, Shield, Eye, X } from 'lucide-react';

// Audit logs component for admin
// TODO: When backend is connected, fetch real audit logs from your Express API
const AdminAuditLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedDateRange, setSelectedDateRange] = useState('Today');
  const [selectedLog, setSelectedLog] = useState<any>(null);

  // TODO: Replace with actual audit logs data from backend API
  const auditLogs = [
    {
      id: "LOG001",
      timestamp: "2024-01-15 10:30:25",
      user: "admin@shop.com",
      action: "User Login",
      category: "Authentication",
      description: "Admin user logged into the system",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      success: true,
      details: { loginMethod: "password", sessionId: "sess_abc123" }
    },
    {
      id: "LOG002",
      timestamp: "2024-01-15 10:28:15",
      user: "admin@shop.com", 
      action: "Product Created",
      category: "Inventory",
      description: "New product added: Power Drill Kit KJ-2000",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      success: true,
      details: { productId: "PROD123", price: "₱3,199.99", category: "Power Tools" }
    },
    {
      id: "LOG003",
      timestamp: "2024-01-15 10:25:45",
      user: "staff@shop.com",
      action: "Order Updated", 
      category: "Orders",
      description: "Order status changed from Pending to Processing",
      ipAddress: "192.168.1.105",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      success: true,
      details: { orderId: "ORD-2441", previousStatus: "Pending", newStatus: "Processing" }
    },
    {
      id: "LOG004",
      timestamp: "2024-01-15 10:20:12",
      user: "john@example.com",
      action: "Failed Login",
      category: "Authentication",
      description: "Failed login attempt - invalid password",
      ipAddress: "203.177.25.45",
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
      success: false,
      details: { reason: "invalid_password", attempts: 3 }
    },
    {
      id: "LOG005",
      timestamp: "2024-01-15 10:15:33",
      user: "admin@shop.com",
      action: "User Account Created",
      category: "User Management", 
      description: "New user account created for staff member",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      success: true,
      details: { newUserId: "USR004", role: "Staff", email: "newstaff@shop.com" }
    },
    {
      id: "LOG006",
      timestamp: "2024-01-15 10:10:58",
      user: "manager@shop.com",
      action: "Stock Updated",
      category: "Inventory",
      description: "Stock quantity updated for Hammer Set Pro",
      ipAddress: "192.168.1.102",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      success: true,
      details: { productId: "HAS9900", previousStock: 12, newStock: 8 }
    }
  ];

  // Get icon for activity category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Authentication':
        return <Shield className="w-4 h-4" />;
      case 'User Management':
        return <User className="w-4 h-4" />;
      case 'Inventory':
        return <Activity className="w-4 h-4" />;
      case 'Orders':
        return <Eye className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  // Get color for success/failure
  const getStatusColor = (success: boolean) => {
    return success ? 'text-green-600' : 'text-red-600';
  };

  // Filter logs based on selected criteria
  const filteredLogs = auditLogs.filter(log => {
    if (selectedFilter !== 'All' && log.category !== selectedFilter) return false;
    if (searchTerm && !log.description.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !log.user.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-dgreen">Audit Logs</h1>
        <p className="text-dgray mt-1">Track all system activities and user actions</p>
      </div>

      {/* Activity Overview */}
      {/* TODO: When backend is ready, calculate real statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-sage-light">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-full p-3">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-dgray">Total Activities</h3>
              <p className="text-2xl font-bold text-dgreen">{auditLogs.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-sage-light">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 rounded-full p-3">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-dgray">Successful Actions</h3>
              <p className="text-2xl font-bold text-green-600">
                {auditLogs.filter(log => log.success).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-sage-light">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 rounded-full p-3">
              <X className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-dgray">Failed Actions</h3>
              <p className="text-2xl font-bold text-red-600">
                {auditLogs.filter(log => !log.success).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-sage-light">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 rounded-full p-3">
              <User className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-dgray">Active Users</h3>
              <p className="text-2xl font-bold text-dgreen">
                {new Set(auditLogs.map(log => log.user)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      {/* TODO: When backend is ready, implement real search and filtering */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-sage-light">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dgray w-5 h-5" />
            <input
              type="text"
              placeholder="Search logs by description or user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
            />
          </div>
          <select 
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="px-4 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
          >
            <option>All</option>
            <option>Authentication</option>
            <option>User Management</option>
            <option>Inventory</option>
            <option>Orders</option>
          </select>
          <select 
            value={selectedDateRange}
            onChange={(e) => setSelectedDateRange(e.target.value)}
            className="px-4 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
          >
            <option>Today</option>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
        </div>

        {/* Audit Logs Table */}
        {/* TODO: When backend is ready, implement pagination and real-time updates */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-sage-light">
                <th className="text-left py-3 px-4 font-medium text-dgreen">Timestamp</th>
                <th className="text-left py-3 px-4 font-medium text-dgreen">User</th>
                <th className="text-left py-3 px-4 font-medium text-dgreen">Action</th>
                <th className="text-left py-3 px-4 font-medium text-dgreen">Category</th>
                <th className="text-left py-3 px-4 font-medium text-dgreen">Status</th>
                <th className="text-left py-3 px-4 font-medium text-dgreen">IP Address</th>
                <th className="text-left py-3 px-4 font-medium text-dgreen">Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="border-b border-sage-light hover:bg-cream">
                  <td className="py-3 px-4 text-sm text-dgray">{log.timestamp}</td>
                  <td className="py-3 px-4 text-sm text-dgreen font-medium">{log.user}</td>
                  <td className="py-3 px-4 text-sm text-dgreen">{log.action}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(log.category)}
                      <span className="text-sm text-dgray">{log.category}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-sm font-medium ${getStatusColor(log.success)}`}>
                      {log.success ? 'Success' : 'Failed'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-dgray">{log.ipAddress}</td>
                  <td className="py-3 px-4">
                    <button 
                      onClick={() => setSelectedLog(log)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Detail Modal */}
      {/* TODO: When backend is ready, fetch additional log details */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-dgreen">Audit Log Details</h2>
              <button 
                onClick={() => setSelectedLog(null)}
                className="text-dgray hover:text-dgreen"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-dgreen mb-2">Basic Information</h3>
                  <p className="text-sm text-dgray mb-1">ID: {selectedLog.id}</p>
                  <p className="text-sm text-dgray mb-1">Timestamp: {selectedLog.timestamp}</p>
                  <p className="text-sm text-dgray mb-1">User: {selectedLog.user}</p>
                  <p className="text-sm text-dgray mb-1">Action: {selectedLog.action}</p>
                  <p className="text-sm text-dgray">Category: {selectedLog.category}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-dgreen mb-2">Technical Details</h3>
                  <p className="text-sm text-dgray mb-1">IP Address: {selectedLog.ipAddress}</p>
                  <p className={`text-sm font-medium mb-1 ${getStatusColor(selectedLog.success)}`}>
                    Status: {selectedLog.success ? 'Success' : 'Failed'}
                  </p>
                  <p className="text-sm text-dgray">User Agent: {selectedLog.userAgent}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-dgreen mb-2">Description</h3>
                <p className="text-sm text-dgray bg-cream rounded-lg p-3">{selectedLog.description}</p>
              </div>

              <div>
                <h3 className="font-semibold text-dgreen mb-2">Additional Details</h3>
                <div className="bg-cream rounded-lg p-3">
                  <pre className="text-sm text-dgray whitespace-pre-wrap">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAuditLogs;