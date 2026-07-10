import { useState } from 'react';
import { reportService } from '../../services/reportService';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/format';

export function Reports() {
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    const params: any = {};
    if (dateRange.start) params.start_date = dateRange.start;
    if (dateRange.end) params.end_date = dateRange.end;

    try {
      let res;
      switch (reportType) {
        case 'sales': res = await reportService.sales({ ...params, report_type: 'daily' }); break;
        case 'profit': res = await reportService.profit(params); break;
        case 'expired': res = await reportService.expired(); break;
        case 'best_selling': res = await reportService.bestSelling(); break;
        default: res = { data: { data: [] } };
      }
      setData(res.data.data || []);
    } catch { toast.error('Failed to load report'); }
    setLoading(false);
  };

  const handleExport = async () => {
    try {
      const params: any = { report_type: reportType };
      if (dateRange.start) params.start_date = dateRange.start;
      if (dateRange.end) params.end_date = dateRange.end;
      const res = await reportService.exportExcel(params);
      const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}_report.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch { toast.error('Export failed'); }
  };

  const getColumns = () => {
    if (!data.length) return [];
    const keys = Object.keys(data[0]);
    return keys.map((key) => ({
      key,
      header: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      render: (v: any) => typeof v === 'number' && key !== 'count' && key !== 'total_quantity' ? formatPrice(v) : String(v || ''),
    }));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border dark:border-gray-700">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Report Type</label>
            <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="sales">Sales Report</option>
              <option value="profit">Profit Report</option>
              <option value="expired">Expired Medicines</option>
              <option value="best_selling">Best Selling</option>
            </select>
          </div>
          <input type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} className="px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          <input type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} className="px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          <Button onClick={fetchReport} loading={loading}>Generate</Button>
          {data.length > 0 && <Button variant="secondary" onClick={handleExport}>Export Excel</Button>}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border dark:border-gray-700">
        {loading ? <LoadingSpinner /> : (
          data.length > 0 ? (
            <Table columns={getColumns()} data={data} />
          ) : (
            <p className="text-center py-8 text-gray-400">Select report type and click Generate</p>
          )
        )}
      </div>
    </div>
  );
}
