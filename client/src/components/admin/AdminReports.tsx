import { BarChart3, TrendingUp, Users, Package } from 'lucide-react';

// Reports and analytics component for admin
// TODO: When backend is connected, fetch real analytics data from your Express API
const AdminReports = () => {
  // TODO: Replace with actual data from backend analytics API
  const reportData = {
    totalRevenue: "₱146,269.92", // TODO: Fetch from /api/admin/analytics/revenue
    totalOrders: "234", // TODO: Fetch from /api/admin/analytics/orders
    avgOrderValue: "₱3,847", // TODO: Calculate from backend data
    conversionRate: "12.4%", // TODO: Fetch from analytics API
    targetAchievement: "84.2%", // TODO: Calculate based on targets
    avgOrderSize: "₱2,847" // TODO: Calculate from order data
  };

  // TODO: Fetch top products data from backend
  const topProducts = [
    { name: "Power Drill Kit KJ-2000", sales: 145, revenue: "₱145,000" },
    { name: "Hammer Set Pro", sales: 127, revenue: "₱31,750" },
    { name: "Wrench Collection", sales: 108, revenue: "₱21,600" },
    { name: "Safety Goggles", sales: 98, revenue: "₱9,800" }
  ];

  // TODO: Fetch category distribution from backend analytics
  const categoryData = [
    { category: "Power Tools", percentage: 35 },
    { category: "Hand Tools", percentage: 28 },
    { category: "Safety Equipment", percentage: 18 },
    { category: "Hardware", percentage: 19 }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-dgreen">Reports & Analytics</h1>
        <p className="text-dgray mt-1">Track your business performance and insights</p>
      </div>

      {/* Time Period Selector */}
      {/* TODO: When backend is ready, implement dynamic date filtering */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-sage-light">
        <div className="flex gap-2">
          <button className="bg-dgreen text-cream px-4 py-2 rounded-lg text-sm">Daily</button>
          <button className="bg-sage-light text-dgreen px-4 py-2 rounded-lg text-sm hover:bg-sage-medium">Weekly</button>
          <button className="bg-sage-light text-dgreen px-4 py-2 rounded-lg text-sm hover:bg-sage-medium">Monthly</button>
          <button className="bg-sage-light text-dgreen px-4 py-2 rounded-lg text-sm hover:bg-sage-medium">Yearly</button>
        </div>
      </div>

      {/* Key Metrics */}
      {/* TODO: When backend is ready, these will update based on selected time period */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-sage-light">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-dgray">Total Revenue</h3>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-dgreen">{reportData.totalRevenue}</p>
          <p className="text-sm text-green-600 mt-1">+15.3% vs previous period</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-sage-light">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-dgray">Total Orders</h3>
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-dgreen">{reportData.totalOrders}</p>
          <p className="text-sm text-blue-600 mt-1">+8.7% vs previous period</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-sage-light">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-dgray">Avg Order Value</h3>
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-dgreen">{reportData.avgOrderValue}</p>
          <p className="text-sm text-purple-600 mt-1">+3.2% vs previous period</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart Placeholder */}
        {/* TODO: When backend is ready, implement actual chart with real data */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-sage-light">
          <h3 className="text-lg font-semibold text-dgreen mb-4">Revenue Trend</h3>
          <div className="h-64 bg-cream rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-sage-medium mx-auto mb-2" />
              <p className="text-dgray">Chart will be implemented with real data</p>
              <p className="text-sm text-dgray">TODO: Connect to analytics API</p>
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        {/* TODO: When backend is ready, fetch real category performance data */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-sage-light">
          <h3 className="text-lg font-semibold text-dgreen mb-4">Category Distribution</h3>
          <div className="space-y-4">
            {categoryData.map((category, index) => (
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
            {topProducts.map((product, index) => (
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
              <span className="text-dgreen font-medium">{reportData.targetAchievement}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-dgray">Conversion Rate</span>
              <span className="text-dgreen font-medium">{reportData.conversionRate}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-dgray">Avg Order Size</span>
              <span className="text-dgreen font-medium">{reportData.avgOrderSize}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;