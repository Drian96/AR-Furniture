import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, Package } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getAdminReports, AdminReportsResponse } from '../../services/api';

// Reports and analytics component for admin
const AdminReports = () => {
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [data, setData] = useState<AdminReportsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await getAdminReports(period);
        setData(res);
      } catch (e: any) {
        setError(e.message || 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [period]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-dgreen">Reports & Analytics</h1>
        <p className="text-dgray mt-1">Track your business performance and insights</p>
      </div>

      {/* Time Period Selector */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-sage-light">
        <div className="flex gap-2">
          {(['day','week','month','year'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`${period===p?'bg-dgreen text-cream':'bg-sage-light text-dgreen hover:bg-sage-medium'} px-4 py-2 rounded-lg text-sm cursor-pointer`}
            >
              {p === 'day' ? 'Daily' : p === 'week' ? 'Weekly' : p === 'month' ? 'Monthly' : 'Yearly'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-sage-light">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-dgray">Total Revenue</h3>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-dgreen">{data ? `₱${Number(data.totalRevenue).toLocaleString()}` : '—'}</p>
          <p className="text-sm text-green-600 mt-1">+15.3% vs previous period</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-sage-light">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-dgray">Total Orders</h3>
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-dgreen">{data ? data.totalOrders : '—'}</p>
          <p className="text-sm text-blue-600 mt-1">+8.7% vs previous period</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-sage-light">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-dgray">Avg Order Value</h3>
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-dgreen">{data ? `₱${Number(data.avgOrderValue).toLocaleString()}` : '—'}</p>
          <p className="text-sm text-purple-600 mt-1">+3.2% vs previous period</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-sage-light">
          <h3 className="text-lg font-semibold text-dgreen mb-4">Revenue Trend</h3>
          {data?.revenueTrend && data.revenueTrend.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="period" 
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`₱${value.toLocaleString()}`, 'Revenue']}
                    labelStyle={{ color: '#374151' }}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 bg-cream rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-sage-medium mx-auto mb-2" />
                <p className="text-dgray">No revenue data available</p>
                <p className="text-sm text-dgray">Data will appear once orders are placed</p>
              </div>
            </div>
          )}
        </div>

        {/* Category Distribution */}
        {/* TODO: When backend is ready, fetch real category performance data */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-sage-light">
          <h3 className="text-lg font-semibold text-dgreen mb-4">Category Distribution</h3>
          <div className="space-y-4">
            {(data?.category || []).map((category, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-dgreen">{category.category}</span>
                  <span className="text-sm text-dgray">{category.percentage}%</span>
                </div>
                <div className="w-full bg-sage-light rounded-full h-2">
                  <div 
                    className="bg-dgreen h-2 rounded-full" 
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        {/* TODO: When backend is ready, fetch from product analytics API */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-sage-light">
          <h3 className="text-lg font-semibold text-dgreen mb-4">Top Products</h3>
          <div className="space-y-3">
            {(data?.topProducts || []).map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-cream rounded-lg">
                <div>
                  <p className="font-medium text-dgreen">{product.name}</p>
                  <p className="text-sm text-dgray">{product.sales} sales</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-dgreen">{product.revenue}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sales Performance */}
        {/* TODO: When backend is ready, calculate actual performance metrics */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-sage-light">
          <h3 className="text-lg font-semibold text-dgreen mb-4">Sales Performance</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-dgray">Target Achievement</span>
              <span className="text-dgreen font-medium">{data?.targetAchievement ? `${data.targetAchievement}%` : '—'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-dgray">Conversion Rate</span>
              <span className="text-dgreen font-medium">{data?.conversionRate ? `${data.conversionRate}%` : '—'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-dgray">Avg Order Size</span>
              <span className="text-dgreen font-medium">{data?.avgOrderSize ? `₱${Number(data.avgOrderSize).toLocaleString()}` : '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {loading && <p className="text-dgray">Loading reports...</p>}
      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
};

export default AdminReports;