import { useState, useEffect } from 'react';
import { reportService } from '../../services/reportService';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export function ExpiredMedicines() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportService.expired().then((res) => {
      setItems(res.data.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  const columns = [
    { key: 'name', header: 'Medicine' },
    { key: 'barcode', header: 'Barcode' },
    { key: 'quantity', header: 'Qty', render: (v: number) => <span className="font-medium">{v}</span> },
    { key: 'expiry_date', header: 'Expired On', render: (v: string) => (
      <span className="text-red-600 dark:text-red-400 font-medium">{v ? new Date(v).toLocaleDateString() : '-'}</span>
    )},
    { key: 'status', header: 'Status', render: () => <Badge variant="danger">Expired</Badge> },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expired Medicines</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          <span className="font-semibold text-red-500">{items.length}</span> {items.length === 1 ? 'medicine has' : 'medicines have'} expired
        </p>
      </div>
      <Table columns={columns} data={items} />
    </div>
  );
}
