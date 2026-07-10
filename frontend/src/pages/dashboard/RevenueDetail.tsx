import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import { reportService } from '../../services/reportService';
import { BarChart } from '../../components/dashboard/BarChart';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Table } from '../../components/ui/Table';
import { formatPrice } from '../../utils/format';

const ALL_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const currentMonthIndex = new Date().getMonth();
const MONTHS = ALL_MONTHS.slice(0, currentMonthIndex + 1);

export function RevenueDetail() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [monthlyHistory, setMonthlyHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'chart' | 'history'>('chart');

  useEffect(() => {
    Promise.all([
      dashboardService.get(),
      reportService.sales({ report_type: 'yearly' }),
    ]).then(([dashRes, salesRes]) => {
      setStats(dashRes.data.data);
      setMonthlyHistory(salesRes.data.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;
  if (!stats) return <div className="text-center py-12 text-gray-500">Failed to load data</div>;

  const monthlyData = stats.monthly_sales_data || [];

  const historyColumns = [
    { key: 'date', header: 'Date', render: (v: string) => new Date(v + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) },
    { key: 'count', header: 'Sales', render: (v: number) => v },
    { key: 'revenue', header: 'Revenue', render: (v: number) => <span className="font-medium text-emerald-600">{formatPrice(v)}</span> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Revenue Details</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Monthly revenue breakdown for {new Date().getFullYear()}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/dashboard/orders-today')}>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenue Today</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1.5">{formatPrice(stats.total_revenue_today || 0)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Revenue</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1.5">{formatPrice(stats.monthly_revenue || 0)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sales This Month</p>
          <p className="text-2xl font-bold text-[#1a5c7a] mt-1.5">{stats.total_sales_this_month || 0}</p>
        </div>
      </div>

      {/* Chart / History toggle */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {view === 'chart' ? 'Monthly Revenue Chart' : 'Monthly Revenue History'}
          </h2>
          <button
            onClick={() => setView(view === 'chart' ? 'history' : 'chart')}
            className="px-4 py-2 text-sm rounded-lg font-medium bg-[#1a5c7a] text-white hover:bg-[#1a5c7a]/90 transition-colors"
          >
            {view === 'chart' ? 'View History' : 'View Chart'}
          </button>
        </div>

        {view === 'chart' ? (
          <BarChart labels={MONTHS} values={monthlyData} label="Revenue (PKR)" height={300} />
        ) : (
          <Table columns={historyColumns} data={monthlyHistory} />
        )}
      </div>
    </div>
  );
}
