import { useEffect, useState } from 'react';
import { TrendingUp, Users, Package, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { getAdminDashboard, AdminDashboardResponse } from '../../services/api';

// Main dashboard overview component for admin
const AdminDashboardMain = () => {
  // local state for dashboard payload
  const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const resp = await getAdminDashboard();
        setData(resp);
      } catch (e: any) {
        setError(e.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-dgreen">Dashboard</h1>
        <p className="text-dgray mt-1">Welcome back! Here's what's happening with your shop today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-sage-light">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dgray text-sm font-medium">Total Sales</p>
              <p className="text-2xl font-bold text-dgreen">{data ? `₱${Number(data.stats.totalSales).toLocaleString()}` : '—'}</p>
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
              <p className="text-2xl font-bold text-dgreen">{data ? data.stats.totalOrders : '—'}</p>
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
              <p className="text-2xl font-bold text-dgreen">{data ? data.stats.totalCustomers : '—'}</p>
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
              <p className="text-2xl font-bold text-dgreen">{data ? data.stats.productsInStock : '—'}</p>
            </div>
            <div className="bg-sage-light rounded-full p-3">
              <TrendingUp className="w-6 h-6 text-dgreen" />
            </div>
          </div>
        </div>
      </div>

      {/* Sales Overview Chart */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-sage-light">
        <h3 className="text-lg font-semibold text-dgreen mb-6">Sales Overview</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data?.salesSeries || []}>
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
        <div className="bg-white rounded-lg p-6 shadow-sm border border-sage-light">
          <h3 className="text-lg font-semibold text-dgreen mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {(data?.recentOrders || []).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-cream rounded-lg">
                <div>
                  <p className="font-medium text-dgreen">{order.id}</p>
                  <p className="text-sm text-dgray">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-dgreen">₱{Number(order.amount).toLocaleString()}</p>
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
        <div className="bg-white rounded-lg p-6 shadow-sm border border-sage-light">
          <h3 className="text-lg font-semibold text-dgreen mb-4">Top Products</h3>
          <div className="space-y-3">
            {(data?.topProducts || []).map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-cream rounded-lg">
                <div>
                  <p className="font-medium text-dgreen">{product.name}</p>
                  <p className="text-sm text-dgray">₱{Number(product.price).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-dgreen">{product.sales} sales</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {loading && <p className="text-dgray">Loading dashboard...</p>}
      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
};

export default AdminDashboardMain;