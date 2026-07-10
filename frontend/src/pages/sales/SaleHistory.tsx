import { useState, useEffect } from 'react';
import { saleService } from '../../services/saleService';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Pagination } from '../../components/ui/Pagination';
import { Badge } from '../../components/ui/Badge';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/format';

const paymentBadge: Record<string, 'success' | 'warning' | 'danger'> = {
  paid: 'success', pending: 'warning', refunded: 'danger',
};

export function SaleHistory() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetch = () => {
    setLoading(true);
    saleService.list({ page, limit: 10 }).then((res) => {
      setSales(res.data.data || []);
      setTotalPages(res.data.total_pages || 1);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [page]);

  const handleRefund = async (id: number) => {
    if (!confirm('Refund this sale?')) return;
    try {
      await saleService.refund(id);
      toast.success('Sale refunded');
      fetch();
    } catch { toast.error('Refund failed'); }
  };

  const columns = [
    { key: 'invoice_number', header: 'Invoice' },
    { key: 'customer', header: 'Customer', render: (_: any, row: any) => row.customer?.name || 'Walk-in' },
    { key: 'total', header: 'Total', render: (v: number) => formatPrice(v) },
    { key: 'payment_method', header: 'Payment', render: (v: string) => v?.replace('_', ' ') },
    { key: 'payment_status', header: 'Status', render: (v: string) => <Badge variant={paymentBadge[v] || 'default'}>{v}</Badge> },
    { key: 'created_at', header: 'Date', render: (v: string) => new Date(v).toLocaleString() },
    { key: 'actions', header: '', render: (_: any, row: any) => row.payment_status === 'paid' ? (
      <Button size="sm" variant="danger" onClick={() => handleRefund(row.id)}>Refund</Button>
    ) : null },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sale History</h1>
      <Table columns={columns} data={sales} loading={loading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
