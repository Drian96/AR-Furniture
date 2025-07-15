import { useState } from 'react';

const MyPurchase = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'to-pay', label: 'To Pay' },
    { id: 'to-ship', label: 'To Ship' },
    { id: 'to-receive', label: 'To Receive' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
    { id: 'return-refund', label: 'Return/Refund' },
  ];

  const orders = [
    {
      id: 'ORD001',
      product: 'Modern Dining Chair',
      image: '/placeholder.svg',
      price: 299,
      quantity: 2,
      status: 'completed',
      date: '2024-01-15',
    },
    {
      id: 'ORD002',
      product: 'Wooden Coffee Table',
      image: '/placeholder.svg',
      price: 599,
      quantity: 1,
      status: 'to-ship',
      date: '2024-01-20',
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-dgreen mb-6">My Purchase</h2>
      
      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="You can search by Order ID or Product name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 border border-lgray rounded-lg focus:outline-none focus:border-dgreen"
        />
      </div>

      {/* Status Tabs */}
      <div className="border-b border-lgray mb-6">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-dgreen text-dgreen'
                  : 'border-transparent text-dgray hover:text-dgreen'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="border border-lgray rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-dgray">Order #{order.id}</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                order.status === 'to-ship' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {order.status.toUpperCase()}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <img
                src={order.image}
                alt={order.product}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h4 className="font-medium text-dgreen">{order.product}</h4>
                <p className="text-dgray text-sm">Quantity: {order.quantity}</p>
                <p className="text-dgreen font-semibold">${order.price}</p>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end space-x-3">
              <button className="px-4 py-2 border border-lgray text-dgray rounded-lg hover:bg-lgray hover:bg-opacity-20 transition-colors">
                Rate
              </button>
              <button className="px-4 py-2 bg-dgreen text-cream rounded-lg hover:bg-opacity-90 transition-colors">
                Buy Again
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyPurchase;