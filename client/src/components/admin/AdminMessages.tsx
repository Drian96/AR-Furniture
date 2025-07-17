import { useState } from 'react';
import { Search, MessageSquare, Reply, Archive, Trash2 } from 'lucide-react';

// Messages management component for admin
// TODO: When backend is connected, fetch real messages data from your Express API
const AdminMessages = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [selectedFilter, setSelectedFilter] = useState('All');

  // TODO: Replace with actual messages data from backend API
  const messages = [
    {
      id: "MSG001",
      from: "John Smith",
      email: "john@example.com",
      subject: "Product Inquiry - Power Drill",
      message: "Hi, I'm interested in the Power Drill Kit KJ-2000. Can you provide more details about warranty?",
      date: "2024-01-15 10:30",
      status: "Unread",
      priority: "Normal"
    },
    {
      id: "MSG002", 
      from: "Sarah Wilson",
      email: "sarah@example.com",
      subject: "Order Issue - Missing Item",
      message: "My recent order ORD-2440 was delivered but one item is missing. Please help resolve this.",
      date: "2024-01-14 09:15",
      status: "Read",
      priority: "High"
    },
    {
      id: "MSG003",
      from: "Mike Johnson", 
      email: "mike@example.com",
      subject: "Return Request",
      message: "I would like to return the hammer set I purchased last week as it doesn't meet my requirements.",
      date: "2024-01-13 14:45",
      status: "Replied",
      priority: "Normal"
    }
  ];

  // TODO: When backend is ready, implement actual message reply functionality
  const handleReplyMessage = (messageId: string) => {
    console.log('Reply to message:', messageId);
    // TODO: Open reply modal or navigate to reply page
  };

  // TODO: When backend is ready, implement message actions
  const handleArchiveMessage = (messageId: string) => {
    console.log('Archive message:', messageId);
    // TODO: API call to archive message
  };

  const handleDeleteMessage = (messageId: string) => {
    console.log('Delete message:', messageId);
    // TODO: API call to delete message
  };

  // Filter messages based on selected filter
  const filteredMessages = messages.filter(message => {
    if (selectedFilter === 'All') return true;
    return message.status === selectedFilter;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-dgreen">Messages</h1>
        <p className="text-dgray mt-1">Manage customer inquiries and communications</p>
      </div>

      {/* Search and Filter Section */}
      {/* TODO: When backend is ready, implement real search functionality */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-sage-light">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dgray w-5 h-5" />
            <input
              type="text"
              placeholder="Search messages..."
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
            <option>Unread</option>
            <option>Read</option>
            <option>Replied</option>
          </select>
        </div>

        {/* Messages List */}
        {/* TODO: When backend is ready, implement pagination */}
        <div className="space-y-3">
          {filteredMessages.map((message) => (
            <div 
              key={message.id} 
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                message.status === 'Unread' 
                  ? 'border-dgreen bg-sage-light' 
                  : 'border-sage-light bg-white hover:bg-cream'
              }`}
              onClick={() => setSelectedMessage(message)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-dgreen">{message.from}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      message.status === 'Unread' ? 'bg-blue-100 text-blue-800' :
                      message.status === 'Read' ? 'bg-gray-100 text-gray-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {message.status}
                    </span>
                    {message.priority === 'High' && (
                      <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800">
                        High Priority
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-dgray mb-1">{message.email}</p>
                  <h4 className="font-medium text-dgreen">{message.subject}</h4>
                  <p className="text-sm text-dgray mt-1 line-clamp-2">{message.message}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-xs text-dgray">{message.date}</p>
                  <div className="flex gap-1 mt-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReplyMessage(message.id);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Reply className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleArchiveMessage(message.id);
                      }}
                      className="text-green-600 hover:text-green-800"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMessage(message.id);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message Detail Modal */}
      {/* TODO: When backend is ready, fetch full message thread */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-dgreen">{selectedMessage.subject}</h2>
                <p className="text-sm text-dgray">From: {selectedMessage.from} ({selectedMessage.email})</p>
                <p className="text-sm text-dgray">Date: {selectedMessage.date}</p>
              </div>
              <button 
                onClick={() => setSelectedMessage(null)}
                className="text-dgray hover:text-dgreen"
              >
                ×
              </button>
            </div>

            <div className="bg-cream rounded-lg p-4 mb-6">
              <p className="text-dgreen">{selectedMessage.message}</p>
            </div>

            {/* Quick Reply Section */}
            {/* TODO: When backend is ready, implement actual reply functionality */}
            <div className="border-t border-sage-light pt-4">
              <h3 className="font-semibold text-dgreen mb-3">Quick Reply</h3>
              <textarea
                rows={4}
                placeholder="Type your reply here..."
                className="w-full px-3 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
              ></textarea>
              <div className="flex gap-2 mt-3">
                <button className="bg-dgreen text-cream px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors">
                  Send Reply
                </button>
                <button 
                  onClick={() => setSelectedMessage(null)}
                  className="px-4 py-2 border border-sage-light text-dgray rounded-lg hover:bg-sage-light transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMessages;