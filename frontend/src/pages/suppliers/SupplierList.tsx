import { useState, useEffect } from 'react';
import { supplierService } from '../../services/supplierService';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Pagination } from '../../components/ui/Pagination';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/format';

export function SupplierList() {
  const { isAdmin } = useAuth();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({});

  const fetch = () => {
    setLoading(true);
    supplierService.list({ page, limit: 10, search }).then((res) => {
      setSuppliers(res.data.data || []);
      setTotalPages(res.data.total_pages || 1);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [page, search]);

  const handleSave = async () => {
    try {
      if (editing?.id) {
        await supplierService.update(editing.id, form);
        toast.success('Supplier updated');
      } else {
        await supplierService.create(form);
        toast.success('Supplier created');
      }
      setShowModal(false);
      fetch();
    } catch (err: any) { toast.error('Error saving supplier'); }
  };

  const columns = [
    { key: 'company_name', header: 'Company' },
    { key: 'contact_person', header: 'Contact' },
    { key: 'phone', header: 'Phone' },
    { key: 'email', header: 'Email' },
    { key: 'outstanding_balance', header: 'Balance', render: (v: number) => formatPrice(v) },
    { key: 'actions', header: '', render: (_: any, row: any) => isAdmin ? (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => { setEditing(row); setForm(row); setShowModal(true); }}>Edit</Button>
        <Button size="sm" variant="danger" onClick={async () => { if (!confirm('Deactivate this supplier?')) return; try { await supplierService.delete(row.id); toast.success('Supplier deactivated'); fetch(); } catch { toast.error('Delete failed'); } }}>Del</Button>
      </div>
    ) : null },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Suppliers</h1>
        {isAdmin && <Button onClick={() => { setEditing(null); setForm({}); setShowModal(true); }}>+ Add Supplier</Button>}
      </div>
      <SearchInput value={search} onChange={setSearch} placeholder="Search suppliers..." />
      <Table columns={columns} data={suppliers} loading={loading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Supplier' : 'Add Supplier'}>
        <div className="space-y-3">
          <Input label="Company Name *" value={form.company_name || ''} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
          <Input label="Contact Person" value={form.contact_person || ''} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} />
          <Input label="Phone" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Address" value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <Input label="Tax Number" value={form.tax_number || ''} onChange={(e) => setForm({ ...form, tax_number: e.target.value })} />
          <Button onClick={handleSave} className="w-full">{editing ? 'Update' : 'Create'}</Button>
        </div>
      </Modal>
    </div>
  );
}
