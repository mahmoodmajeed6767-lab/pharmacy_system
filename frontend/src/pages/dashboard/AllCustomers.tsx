import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerService } from '../../services/customerService';
import { Table } from '../../components/ui/Table';
import { SearchInput } from '../../components/ui/SearchInput';
import { Pagination } from '../../components/ui/Pagination';
import { Badge } from '../../components/ui/Badge';

export function AllCustomers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');

  const fetch = () => {
    setLoading(true);
    customerService.list({ page, limit: 15, search }).then((res) => {
      setCustomers(res.data.data || []);
      setTotalPages(res.data.total_pages || 1);
      setTotal(res.data.total || 0);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [page, search]);

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'phone', header: 'Phone' },
    { key: 'email', header: 'Email' },
    { key: 'total_spent', header: 'Total Spent', render: (v: number) => v ? `Rs. ${v.toLocaleString()}` : '-' },
    { key: 'loyalty_points', header: 'Loyalty Points', render: (v: number) => <Badge variant="success">{v || 0}</Badge> },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Customers</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total: <span className="font-semibold">{total}</span> customers</p>
        </div>
        <button onClick={() => navigate('/customers')} className="text-sm text-[#1a5c7a] hover:underline">Manage Customers →</button>
      </div>
      <SearchInput value={search} onChange={setSearch} placeholder="Search customers..." />
      <Table columns={columns} data={customers} loading={loading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
