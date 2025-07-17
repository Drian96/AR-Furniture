import { useState } from 'react';
import { Search, Plus, Eye, Edit, Trash2, X } from 'lucide-react';

// Stock management component for admin
// TODO: When backend is connected, fetch real inventory data from your Express API
const AdminViewStocks = () => {
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All Status');

  // TODO: Replace with actual inventory data from backend API
  const inventoryStats = {
    totalInventoryValue: "₱146,269.92", // TODO: Fetch from /api/admin/inventory/value
    lowStockItems: "2", // TODO: Fetch items below minimum threshold
    outOfStockItems: "0" // TODO: Fetch items with zero quantity
  };

  // TODO: Replace with actual stock data from backend
  const stockItems = [
    {
      id: "SKU001",
      name: "Power Drill Kit KJ-2000",
      category: "Power Tools", 
      supplier: "Skillset",
      quantity: 45,
      price: "₱3,199.99",
      status: "In Stock"
    },
    {
      id: "HAS9900",
      name: "Premium Hammer Set Pro",
      category: "Hand Tools",
      supplier: "Stanley", 
      quantity: 8,
      price: "₱250.99",
      status: "Low Stock"
    },
    {
      id: "SDG500",
      name: "Industrial Screwdriver Kit",
      category: "Hand Tools",
      supplier: "Bosch",
      quantity: 0,
      price: "₱220.99", 
      status: "Out of Stock"
    }
  ];

  // TODO: When backend is ready, implement actual item creation
  const handleAddItem = (formData: any) => {
    console.log('Adding new item:', formData);
    // TODO: API call to create new inventory item
    setShowAddItemModal(false);
  };

  // TODO: When backend is ready, implement edit/delete functionality
  const handleEditItem = (itemId: string) => {
    console.log('Edit item:', itemId);
    // TODO: Open edit modal with item data
  };

  const handleDeleteItem = (itemId: string) => {
    console.log('Delete item:', itemId);
    // TODO: Show confirmation dialog then API call to delete
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-dgreen">Stock Management</h1>
          <p className="text-dgray mt-1">Manage your inventory and stock levels</p>
        </div>
        <button 
          onClick={() => setShowAddItemModal(true)}
          className="bg-dgreen text-cream px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Item
        </button>
      </div>

      {/* Inventory Overview Cards */}
      {/* TODO: When backend is ready, these will update in real-time */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-sage-light">
          <h3 className="text-sm font-medium text-dgray mb-2">Total Inventory Value</h3>
          <p className="text-2xl font-bold text-dgreen">{inventoryStats.totalInventoryValue}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-sage-light">
          <h3 className="text-sm font-medium text-dgray mb-2">Low Stock Items</h3>
          <p className="text-2xl font-bold text-orange-600">{inventoryStats.lowStockItems}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-sage-light">
          <h3 className="text-sm font-medium text-dgray mb-2">Out of Stock Items</h3>
          <p className="text-2xl font-bold text-red-600">{inventoryStats.outOfStockItems}</p>
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
              placeholder="Search by name, SKU or supplier"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
            />
          </div>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
          >
            <option>All Categories</option>
            <option>Power Tools</option>
            <option>Hand Tools</option>
            <option>Safety Equipment</option>
            <option>Hardware</option>
          </select>
          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
          >
            <option>All Status</option>
            <option>In Stock</option>
            <option>Low Stock</option>
            <option>Out of Stock</option>
          </select>
        </div>

        {/* Stock Items Table */}
        {/* TODO: When backend is ready, implement pagination and sorting */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-sage-light">
                <th className="text-left py-3 px-4 font-medium text-dgreen">Name</th>
                <th className="text-left py-3 px-4 font-medium text-dgreen">SKU</th>
                <th className="text-left py-3 px-4 font-medium text-dgreen">Category</th>
                <th className="text-left py-3 px-4 font-medium text-dgreen">Supplier</th>
                <th className="text-left py-3 px-4 font-medium text-dgreen">Quantity</th>
                <th className="text-left py-3 px-4 font-medium text-dgreen">Price</th>
                <th className="text-left py-3 px-4 font-medium text-dgreen">Status</th>
                <th className="text-left py-3 px-4 font-medium text-dgreen">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stockItems.map((item) => (
                <tr key={item.id} className="border-b border-sage-light hover:bg-cream">
                  <td className="py-3 px-4 text-dgreen font-medium">{item.name}</td>
                  <td className="py-3 px-4 text-dgray">{item.id}</td>
                  <td className="py-3 px-4 text-dgray">{item.category}</td>
                  <td className="py-3 px-4 text-dgray">{item.supplier}</td>
                  <td className="py-3 px-4 text-dgray">{item.quantity}</td>
                  <td className="py-3 px-4 text-dgreen font-medium">{item.price}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.status === 'In Stock' ? 'bg-green-100 text-green-800' :
                      item.status === 'Low Stock' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditItem(item.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Item Modal */}
      {/* TODO: When backend is ready, implement actual form submission */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-dgreen">Add New Stock Item</h2>
              <button 
                onClick={() => setShowAddItemModal(false)}
                className="text-dgray hover:text-dgreen"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dgreen mb-1">Product Name *</label>
                  <input
                    type="text"
                    placeholder="Enter product name"
                    className="w-full px-3 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dgreen mb-1">Product Code</label>
                  <input
                    type="text"
                    placeholder="Product code"
                    className="w-full px-3 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dgreen mb-1">Category *</label>
                  <select className="w-full px-3 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen">
                    <option>Select category</option>
                    <option>Power Tools</option>
                    <option>Hand Tools</option>
                    <option>Safety Equipment</option>
                    <option>Hardware</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dgreen mb-1">Supplier *</label>
                  <input
                    type="text"
                    placeholder="Enter supplier name"
                    className="w-full px-3 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dgreen mb-1">Price (₱) *</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    className="w-full px-3 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dgreen mb-1">Quantity *</label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-3 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dgreen mb-1">Minimum Stock Level</label>
                <input
                  type="number"
                  placeholder="10"
                  className="w-full px-3 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dgreen mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Product description..."
                  className="w-full px-3 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
                ></textarea>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddItemModal(false)}
                  className="flex-1 px-4 py-2 border border-sage-light text-dgray rounded-lg hover:bg-sage-light transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    handleAddItem({});
                  }}
                  className="flex-1 px-4 py-2 bg-dgreen text-cream rounded-lg hover:bg-opacity-90 transition-colors"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminViewStocks;