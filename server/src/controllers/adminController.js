// Admin analytics and audit controllers
// NOTE: We use raw SQL against Supabase tables to avoid creating many Sequelize models up front.
// Keep queries simple and efficient; adjust column/table names if your Supabase differs.

const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

// Helper to parse timeframe filters into SQL WHERE clauses
function buildDateRangeFilter(period) {
  // period can be 'day', 'week', 'month', 'year'
  switch (period) {
    case 'day':
      return "created_at >= NOW() - INTERVAL '1 day'";
    case 'week':
      return "created_at >= NOW() - INTERVAL '7 day'";
    case 'month':
      return "created_at >= NOW() - INTERVAL '1 month'";
    case 'year':
      return "created_at >= NOW() - INTERVAL '1 year'";
    default:
      return 'TRUE';
  }
}

// GET /admin/dashboard
// Returns headline stats and small datasets for dashboard widgets
exports.getDashboard = async (req, res) => {
  try {
    // Compute totals in parallel
    const [salesRow] = await sequelize.query(
      `SELECT COALESCE(SUM(total_amount),0)::numeric AS total_sales FROM public.orders`,
      { type: QueryTypes.SELECT }
    );
    const [ordersRow] = await sequelize.query(
      `SELECT COUNT(*)::int AS total_orders FROM public.orders`,
      { type: QueryTypes.SELECT }
    );
    const [customersRow] = await sequelize.query(
      `SELECT COUNT(*)::int AS total_customers FROM public.users`,
      { type: QueryTypes.SELECT }
    );
    const [stockRow] = await sequelize.query(
      `SELECT COALESCE(SUM(quantity),0)::int AS products_in_stock FROM public.products`,
      { type: QueryTypes.SELECT }
    );

    // Recent orders
    const recentOrders = await sequelize.query(
      `SELECT o.order_number AS id,
              (o.first_name || ' ' || o.last_name) AS customer,
              o.total_amount AS amount,
              o.status
         FROM public.orders o
        ORDER BY o.created_at DESC
        LIMIT 5`,
      { type: QueryTypes.SELECT }
    );

    // Top products by sales qty
    const topProducts = await sequelize.query(
      `SELECT p.name,
              p.price,
              COALESCE(SUM(oi.quantity),0)::int AS sales
         FROM public.products p
         LEFT JOIN public.order_items oi ON oi.product_id = p.id
         LEFT JOIN public.orders o ON o.id = oi.order_id
        GROUP BY p.id
        ORDER BY sales DESC
        LIMIT 5`,
      { type: QueryTypes.SELECT }
    );

    // Sales by month (last 6 months)
    const salesSeries = await sequelize.query(
      `SELECT TO_CHAR(month, 'Mon') AS month,
              sales
         FROM (
               SELECT date_trunc('month', created_at) AS month,
                      COALESCE(SUM(total_amount),0)::numeric AS sales
                 FROM public.orders
                WHERE created_at >= NOW() - INTERVAL '6 months'
                GROUP BY 1
          ) t
        ORDER BY month`,
      { type: QueryTypes.SELECT }
    );

    return res.json({
      success: true,
      data: {
        stats: {
          totalSales: salesRow.total_sales,
          totalOrders: ordersRow.total_orders,
          totalCustomers: customersRow.total_customers,
          productsInStock: stockRow.products_in_stock,
        },
        recentOrders,
        topProducts,
        salesSeries,
      },
    });
  } catch (error) {
    console.error('Admin getDashboard error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load dashboard', error: String(error?.message || error) });
  }
};

// GET /admin/reports?period=month
exports.getReports = async (req, res) => {
  try {
    const period = (req.query.period || 'month').toLowerCase();
    const whereClause = buildDateRangeFilter(period);

    const [revenueRow] = await sequelize.query(
      `SELECT COALESCE(SUM(total_amount),0)::numeric AS total_revenue FROM public.orders WHERE ${whereClause}`,
      { type: QueryTypes.SELECT }
    );
    const [ordersRow] = await sequelize.query(
      `SELECT COUNT(*)::int AS total_orders FROM public.orders WHERE ${whereClause}`,
      { type: QueryTypes.SELECT }
    );
    const [avgOrderRow] = await sequelize.query(
      `SELECT COALESCE(AVG(total_amount),0)::numeric AS avg_order_value FROM public.orders WHERE ${whereClause}`,
      { type: QueryTypes.SELECT }
    );

    // Category distribution: percentage of qty per product category
    const category = await sequelize.query(
      `SELECT p.category,
              ROUND(100.0 * SUM(oi.quantity) / NULLIF(SUM(SUM(oi.quantity)) OVER (),0), 1) AS percentage
         FROM public.order_items oi
         JOIN public.orders o ON o.id = oi.order_id
         JOIN public.products p ON p.id = oi.product_id
        WHERE ${whereClause.replaceAll('created_at', 'o.created_at')}
        GROUP BY p.category
        ORDER BY percentage DESC
        LIMIT 8`,
      { type: QueryTypes.SELECT }
    );

    const topProducts = await sequelize.query(
      `SELECT p.name,
              COALESCE(SUM(oi.quantity),0)::int AS sales,
              TO_CHAR(COALESCE(SUM(oi.quantity * oi.price),0),'FM999999990.00') AS revenue
         FROM public.products p
         LEFT JOIN public.order_items oi ON oi.product_id = p.id
         LEFT JOIN public.orders o ON o.id = oi.order_id
        WHERE ${whereClause.replaceAll('created_at', 'o.created_at')}
        GROUP BY p.id
        ORDER BY sales DESC
        LIMIT 8`,
      { type: QueryTypes.SELECT }
    );

    // Simple derived metrics placeholders
    const report = {
      totalRevenue: revenueRow.total_revenue,
      totalOrders: ordersRow.total_orders,
      avgOrderValue: avgOrderRow.avg_order_value,
      conversionRate: null, // Requires sessions/visits tracking table
      targetAchievement: null, // Requires targets table
      avgOrderSize: avgOrderRow.avg_order_value, // proxy if no items count
      category,
      topProducts,
    };

    return res.json({ success: true, data: report });
  } catch (error) {
    console.error('Admin getReports error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load reports' });
  }
};

// GET /admin/audit-logs
exports.getAuditLogs = async (req, res) => {
  try {
    const { q, category, period } = req.query;
    const filters = [];
    const params = {};

    if (q) {
      filters.push("(description ILIKE :q OR user_email ILIKE :q)");
      params.q = `%${q}%`;
    }
    if (category && category !== 'All') {
      filters.push('category = :category');
      params.category = category;
    }
    if (period) {
      const clause = buildDateRangeFilter(period);
      filters.push(clause);
    }
    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const logs = await sequelize.query(
      `SELECT id,
              to_char(created_at, 'YYYY-MM-DD HH24:MI:SS') AS timestamp,
              user_email AS user,
              action,
              category,
              description,
              ip_address,
              user_agent,
              success,
              details
         FROM public.audit_logs
         ${where}
        ORDER BY created_at DESC
        LIMIT 200`,
      { type: QueryTypes.SELECT, replacements: params }
    );

    return res.json({ success: true, data: logs });
  } catch (error) {
    console.error('Admin getAuditLogs error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load audit logs' });
  }
};

// POST /admin/audit-logs
exports.createAuditLog = async (req, res) => {
  try {
    const { user_email, action, category, description, ip_address, user_agent, success, details } = req.body;
    const [row] = await sequelize.query(
      `INSERT INTO audit_logs (user_email, action, category, description, ip_address, user_agent, success, details)
       VALUES (:user_email, :action, :category, :description, :ip_address, :user_agent, :success, :details)
       RETURNING id`,
      {
        type: QueryTypes.INSERT,
        replacements: { user_email, action, category, description, ip_address, user_agent, success, details },
      }
    );
    return res.status(201).json({ success: true, data: { id: row?.id } });
  } catch (error) {
    console.error('Admin createAuditLog error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create audit log' });
  }
};


