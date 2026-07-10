import { useState, useEffect } from 'react';
import { customerService } from '../../services/customerService';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Pagination } from '../../components/ui/Pagination';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/format';

export function CustomerList() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({});

  const fetch = () => {
    setLoading(true);
    customerService.list({ page, limit: 10, search }).then((res) => {
      setCustomers(res.data.data || []);
      setTotalPages(res.data.total_pages || 1);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [page, search]);

  const handleSave = async () => {
    try {
      if (editing?.id) { await customerService.update(editing.id, form); toast.success('Customer updated'); }
      else { await customerService.create(form); toast.success('Customer created'); }
      setShowModal(false);
      fetch();
    } catch { toast.error('Error saving customer'); }
  };

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'phone', header: 'Phone' },
    { key: 'email', header: 'Email' },
    { key: 'total_purchases', header: 'Total Purchases', render: (v: number) => formatPrice(v) },
    { key: 'loyalty_points', header: 'Loyalty Points', render: (v: number) => Math.round(v) },
    { key: 'actions', header: '', render: (_: any, row: any) => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => { setEditing(row); setForm(row); setShowModal(true); }}>Edit</Button>
        <Button size="sm" variant="danger" onClick={async () => { if (!confirm('Deactivate this customer?')) return; try { await customerService.delete(row.id); toast.success('Customer deactivated'); fetch(); } catch { toast.error('Delete failed'); } }}>Del</Button>
      </div>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
        <Button onClick={() => { setEditing(null); setForm({}); setShowModal(true); }}>+ Add Customer</Button>
      </div>
      <SearchInput value={search} onChange={setSearch} placeholder="Search customers..." />
      <Table columns={columns} data={customers} loading={loading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Customer' : 'Add Customer'}>
        <div className="space-y-3">
          <Input label="Name *" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Phone" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Address" value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <Input label="Date of Birth" type="date" value={form.date_of_birth || ''} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} />
          <Button onClick={handleSave} className="w-full">{editing ? 'Update' : 'Create'}</Button>
        </div>
      </Modal>
    </div>
  );
}
