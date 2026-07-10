import { useState, useEffect } from 'react';
import { saleService } from '../../services/saleService';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { formatPrice } from '../../utils/format';

const paymentBadge: Record<string, 'success' | 'warning' | 'danger'> = {
  paid: 'success', pending: 'warning', refunded: 'danger',
};

const today = new Date().toISOString().split('T')[0];

export function OrdersToday() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    saleService.list({ start_date: today, end_date: today, limit: 100 }).then((res) => {
      const data = res.data.data || [];
      setOrders(data);
      setTotalRevenue(data.reduce((sum: number, o: any) => sum + (o.total || 0), 0));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'invoice_number', header: 'Invoice' },
    { key: 'customer_name', header: 'Customer', render: (v: string) => v || 'Walk-in' },
    { key: 'total', header: 'Total', render: (v: number) => <span className="font-medium">{formatPrice(v)}</span> },
    { key: 'payment_method', header: 'Payment' },
    { key: 'payment_status', header: 'Status', render: (v: string) => <Badge variant={paymentBadge[v] || 'default'}>{v}</Badge> },
    { key: 'created_at', header: 'Time', render: (v: string) => new Date(v).toLocaleTimeString() },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Today's Orders</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{today}</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Orders Today</p>
          <p className="text-2xl font-bold text-[#1a5c7a] mt-1.5">{orders.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenue Today</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1.5">{formatPrice(totalRevenue)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Order</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1.5">
            {orders.length > 0 ? formatPrice(Math.round(totalRevenue / orders.length)) : 'Rs. 0'}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Orders List</h2>
        </div>
        <div className="p-1">
          <Table columns={columns} data={orders} loading={loading} />
        </div>
      </div>
    </div>
  );
}
