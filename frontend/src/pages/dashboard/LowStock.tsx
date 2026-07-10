import { useState, useEffect } from 'react';
import { medicineService } from '../../services/medicineService';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export function LowStock() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    medicineService.list({ limit: 100, low_stock: true }).then((res) => {
      setItems(res.data.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  const columns = [
    { key: 'name', header: 'Medicine' },
    { key: 'quantity', header: 'Current Stock', render: (v: number) => (
      <span className="text-orange-600 dark:text-orange-400 font-semibold">{v}</span>
    )},
    { key: 'min_stock', header: 'Min Stock', render: (v: number) => <span className="text-gray-500">{v}</span> },
    { key: 'status', header: 'Status', render: (_: any, r: any) => {
      if (r.quantity <= 0) return <Badge variant="danger">Out of Stock</Badge>;
      return <Badge variant="warning">Low Stock</Badge>;
    }},
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Low Stock Items</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          <span className="font-semibold text-orange-500">{items.length}</span> {items.length === 1 ? 'item needs' : 'items need'} restocking
        </p>
      </div>
      <Table columns={columns} data={items} />
    </div>
  );
}
