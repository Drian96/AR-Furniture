import { TrendingUp, Users, Package, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

// Main dashboard overview component for admin
// TODO: When backend is connected, fetch real analytics data from your Express API
const AdminDashboardMain = () => {
  // TODO: Replace with actual data from backend API calls
  const dashboardStats = {
    totalSales: "₱124,850", // TODO: Fetch from /api/admin/stats/sales
    totalOrders: "842", // TODO: Fetch from /api/admin/stats/orders
    totalCustomers: "1254", // TODO: Fetch from /api/admin/stats/customers
    productsInStock: "3421" // TODO: Fetch from /api/admin/stats/products
  };

  // TODO: Fetch recent orders from backend
  const recentOrders = [
    { id: "ORD-2441", customer: "John Smith", amount: "₱299.99", status: "Delivered" },
    { id: "ORD-2440", customer: "Sarah Johnson", amount: "₱85.50", status: "Processing" },
    { id: "ORD-2439", customer: "Mike Wilson", amount: "₱149.99", status: "Shipped" }
  ];

  // TODO: Fetch top products from backend analytics
  const topProducts = [
    { name: "Premium Toolkit", price: "₱2,500", sales: 145 },
    { name: "Garden Equipment Set", price: "₱1,850", sales: 98 },
    { name: "Safety Goggles", price: "₱850", sales: 76 }
  ];

  // TODO: Fetch sales chart data from backend API
  const salesData = [
    { month: 'July', sales: 250 },
    { month: 'August', sales: 400 },
    { month: 'September', sales: 600 },
    { month: 'October', sales: 300 },
    { month: 'November', sales: 550 },
    { month: 'December', sales: 900 }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-dgreen">Dashboard</h1>
        <p className="text-dgray mt-1">Welcome back! Here's what's happening with your shop today.</p>
      </div>

      {/* Stats Cards */}
      {/* TODO: When backend is ready, these will update in real-time */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-sage-light">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dgray text-sm font-medium">Total Sales</p>
              <p className="text-2xl font-bold text-dgreen">{dashboardStats.totalSales}</p>
            </div>
            <div className="bg-sage-light rounded-full p-3">
              <DollarSign className="w-6 h-6 text-dgreen" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-sage-light">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dgray text-sm font-medium">Total Orders</p>
              <p className="text-2xl font-bold text-dgreen">{dashboardStats.totalOrders}</p>
            </div>
            <div className="bg-sage-light rounded-full p-3">
              <Package className="w-6 h-6 text-dgreen" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-sage-light">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dgray text-sm font-medium">Total Customers</p>
              <p className="text-2xl font-bold text-dgreen">{dashboardStats.totalCustomers}</p>
            </div>
            <div className="bg-sage-light rounded-full p-3">
              <Users className="w-6 h-6 text-dgreen" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-sage-light">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dgray text-sm font-medium">Products in Stock</p>
              <p className="text-2xl font-bold text-dgreen">{dashboardStats.productsInStock}</p>
            </div>
            <div className="bg-sage-light rounded-full p-3">
              <TrendingUp className="w-6 h-6 text-dgreen" />
            </div>
          </div>
        </div>
      </div>

      {/* Sales Overview Chart */}
      {/* TODO: When backend is ready, fetch real sales data for the chart */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-sage-light">
        <h3 className="text-lg font-semibold text-dgreen mb-6">Sales Overview</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesData}>
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                className="text-dgray"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                className="text-dgray"
              />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="#4A7C59" 
                strokeWidth={3}
                dot={{ fill: '#4A7C59', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#4A7C59', strokeWidth: 2, fill: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        {/* TODO: When backend is ready, implement real-time order updates */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-sage-light">
          <h3 className="text-lg font-semibold text-dgreen mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-cream rounded-lg">
                <div>
                  <p className="font-medium text-dgreen">{order.id}</p>
                  <p className="text-sm text-dgray">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-dgreen">{order.amount}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        {/* TODO: When backend is ready, fetch from analytics API */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-sage-light">
          <h3 className="text-lg font-semibold text-dgreen mb-4">Top Products</h3>
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-cream rounded-lg">
                <div>
                  <p className="font-medium text-dgreen">{product.name}</p>
                  <p className="text-sm text-dgray">{product.price}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-dgreen">{product.sales} sales</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardMain;