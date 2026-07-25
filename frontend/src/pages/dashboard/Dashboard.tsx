import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { dashboardService } from '../../services/dashboardService';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Badge } from '../../components/ui/Badge';
import { formatPrice } from '../../utils/format';
import { BarChart } from '../../components/dashboard/BarChart';
import { DoughnutChart } from '../../components/dashboard/DoughnutChart';
import { formatTpl } from '../../translations';

const paymentBadge: Record<string, 'success' | 'warning' | 'danger'> = {
  paid: 'success', 
  pending: 'warning', 
  refunded: 'danger',
};

const ALL_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const currentMonthIndex = new Date().getMonth(); // 0-based
const MONTHS = ALL_MONTHS.slice(0, currentMonthIndex + 1);

export function Dashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.get()
      .then((res) => {
        // Safe data extraction: handle both res.data.data and res.data structures
        const data = res?.data?.data !== undefined ? res.data.data : res?.data;
        setStats(data || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Dashboard Service Error:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;
  if (!stats) return <div className="text-center py-12 text-gray-500">{t.dashboard.failedToLoad}</div>;

  const saleColumns = [
    { key: 'invoice_number', header: t.dashboard.invoice },
    { 
      key: 'total', 
      header: t.dashboard.total, 
      render: (v: number, row: any) => (
        <span className="font-medium">{formatPrice(v ?? row?.total_amount ?? 0)}</span>
      ) 
    },
    { key: 'payment_method', header: t.dashboard.payment, render: (v: string) => v || 'Cash' },
    { 
      key: 'payment_status', 
      header: t.dashboard.status, 
      render: (v: string) => (
        <Badge variant={paymentBadge[v?.toLowerCase()] || 'default'}>{v || 'paid'}</Badge>
      ) 
    },
    { 
      key: 'created_at', 
      header: t.dashboard.date, 
      render: (v: string) => (v ? new Date(v).toLocaleDateString() : 'N/A') 
    },
  ];

  const monthlyData = stats?.monthly_sales_data || [];

  const catLabels = stats?.category_distribution?.map((c: any) => c.name) || [];
  const catValues = stats?.category_distribution?.map((c: any) => c.count) || [];

  const handleCategoryClick = (label: string) => {
    navigate(`/medicines?category=${encodeURIComponent(label)}`);
  };

  const categoryData = {
    labels: catLabels,
    values: catValues,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.dashboard.title}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.dashboard.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card
          title={t.dashboard.totalMedicines}
          value={stats.total_medicines || 0}
          subtitle={formatTpl(t.dashboard.lowInStock, { count: stats.low_stock_medicines || 0 })}
          accent="blue"
          onClick={() => navigate('/dashboard/medicines')}
          icon={
            <svg className="w-5 h-5 text-[#1a5c7a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6" />
            </svg>
          }
        />
        <Card
          title={t.dashboard.lowStock}
          value={stats.low_stock_medicines || 0}
          subtitle={stats.low_stock_medicines > 0 ? t.dashboard.needsRestocking : t.dashboard.allStockedUp}
          accent="orange"
          onClick={() => navigate('/dashboard/low-stock')}
          icon={
            <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          }
        />
        <Card
          title={t.dashboard.monthlyRevenue}
          value={formatPrice(stats.monthly_revenue || 0)}
          subtitle={formatTpl(t.dashboard.salesToday, { count: stats.total_sales_today || 0 })}
          accent="green"
          onClick={() => navigate('/dashboard/revenue')}
          icon={
            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          }
        />
        <Card
          title={t.dashboard.customers}
          value={stats.total_customers || 0}
          accent="purple"
          onClick={() => navigate('/dashboard/customers')}
          icon={
            <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">{t.dashboard.monthlyRevenue}</h2>
            <span className="text-xs text-gray-400">{t.dashboard.thisYear}</span>
          </div>
          <BarChart
            labels={MONTHS}
            values={monthlyData}
            label="Revenue (PKR)"
            height={250}
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">{t.dashboard.inventoryByCategory}</h2>
          <DoughnutChart
            labels={categoryData.labels}
            values={categoryData.values}
            height={250}
            onSegmentClick={handleCategoryClick}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">{t.dashboard.recentSales}</h2>
          </div>
          <div className="p-1">
            <Table columns={saleColumns} data={stats.recent_sales?.slice(0, 5) || []} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">{t.dashboard.todaysSummary}</h2>
          <div className="space-y-3">
            <div 
              className="flex items-center justify-between p-3.5 rounded-lg bg-gradient-to-r from-[#1a5c7a]/5 to-transparent border border-[#1a5c7a]/10 cursor-pointer hover:from-[#1a5c7a]/10 transition-all" 
              onClick={() => navigate('/dashboard/orders-today')}
            >
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t.dashboard.totalOrders}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{stats.total_sales_today || 0}</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-[#1a5c7a]/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-[#1a5c7a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3.5 rounded-lg bg-gradient-to-r from-emerald-500/5 to-transparent border border-emerald-500/10">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t.dashboard.revenueToday}</p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{formatPrice(stats.total_revenue_today || 0)}</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-lg bg-gradient-to-r from-purple-500/5 to-transparent border border-purple-500/10">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t.dashboard.monthlyRevenue}</p>
                <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-0.5">{formatPrice(stats.monthly_revenue || 0)}</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                </svg>
              </div>
            </div>

            {stats?.expired_medicines > 0 && (
              <div 
                className="flex items-center justify-between p-3.5 rounded-lg bg-gradient-to-r from-red-500/5 to-transparent border border-red-500/10 cursor-pointer hover:from-red-500/10 transition-all" 
                onClick={() => navigate('/dashboard/expired')}
              >
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t.dashboard.expiredMedicines}</p>
                  <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-0.5">{stats.expired_medicines}</p>
                </div>
                <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}