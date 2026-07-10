import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { medicineService } from '../../services/medicineService';
import { Table } from '../../components/ui/Table';
import { SearchInput } from '../../components/ui/SearchInput';
import { Pagination } from '../../components/ui/Pagination';
import { Badge } from '../../components/ui/Badge';
import { formatPrice } from '../../utils/format';

export function AllMedicines() {
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');

  const fetch = () => {
    setLoading(true);
    medicineService.list({ page, limit: 15, search }).then((res) => {
      setMedicines(res.data.data || []);
      setTotalPages(res.data.total_pages || 1);
      setTotal(res.data.total || 0);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [page, search]);

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'barcode', header: 'Barcode' },
    { key: 'selling_price', header: 'Price', render: (v: number) => formatPrice(v) },
    { key: 'quantity', header: 'Stock', render: (_: any, r: any) => {
      if (r.quantity <= 0) return <Badge variant="danger">Out of Stock</Badge>;
      if (r.quantity <= r.min_stock) return <Badge variant="warning">Low ({r.quantity})</Badge>;
      return <Badge variant="success">{r.quantity}</Badge>;
    }},
    { key: 'expiry_date', header: 'Expiry' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Medicines</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total: <span className="font-semibold">{total}</span> medicines registered</p>
        </div>
        <button onClick={() => navigate('/medicines')} className="text-sm text-[#1a5c7a] hover:underline">Manage Medicines →</button>
      </div>
      <SearchInput value={search} onChange={setSearch} placeholder="Search medicines..." />
      <Table columns={columns} data={medicines} loading={loading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
