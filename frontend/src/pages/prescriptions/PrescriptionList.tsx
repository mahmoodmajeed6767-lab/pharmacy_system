import { useState, useEffect } from 'react';
import { prescriptionService } from '../../services/prescriptionService';
import { customerService } from '../../services/customerService';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { Pagination } from '../../components/ui/Pagination';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const statusBadge: Record<string, 'warning' | 'success' | 'danger'> = {
  pending: 'warning', approved: 'success', rejected: 'danger',
};

export function PrescriptionList() {
  const { isAdmin, isPharmacist } = useAuth();
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showUpload, setShowUpload] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [customerId, setCustomerId] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);

  const fetch = () => {
    setLoading(true);
    prescriptionService.list({ page, limit: 10, status: statusFilter || undefined }).then((res) => {
      setPrescriptions(res.data.data || []);
      setTotalPages(res.data.total_pages || 1);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [page, statusFilter]);
  useEffect(() => { customerService.list({ limit: 100 }).then((res) => setCustomers(res.data.data || [])); }, []);

  const handleUpload = async () => {
    if (!customerId || !file) return toast.error('Select customer and file');
    const fd = new FormData();
    fd.append('customer_id', customerId);
    fd.append('notes', '');
    fd.append('file', file);
    try {
      await prescriptionService.create(fd);
      toast.success('Prescription uploaded');
      setShowUpload(false);
      setFile(null);
      setCustomerId('');
      fetch();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      const msg = typeof detail === 'string' ? detail : JSON.stringify(detail || 'Upload failed');
      toast.error(msg);
    }
  };

  const handleStatus = async (id: number, status: string) => {
    try {
      await prescriptionService.update(id, { status });
      toast.success(`Prescription ${status}`);
      fetch();
    } catch { toast.error('Update failed'); }
  };

  const columns = [
    { key: 'customer', header: 'Customer', render: (_: any, row: any) => row.customer?.name || `#${row.customer_id}` },
    { key: 'status', header: 'Status', render: (v: string) => <Badge variant={statusBadge[v] || 'default'}>{v}</Badge> },
    { key: 'uploader', header: 'Uploaded By', render: (_: any, row: any) => row.uploader?.full_name || '' },
    { key: 'created_at', header: 'Date', render: (v: string) => new Date(v).toLocaleDateString() },
    { key: 'image', header: 'File', render: (_: any, row: any) => row.image_path ? <a href={row.image_path} target="_blank" className="text-blue-600 text-sm">View</a> : '-' },
    { key: 'actions', header: '', render: (_: any, row: any) => row.status === 'pending' && (isAdmin || isPharmacist) ? (
      <div className="flex gap-1">
        <Button size="sm" variant="primary" onClick={() => handleStatus(row.id, 'approved')}>Approve</Button>
        <Button size="sm" variant="danger" onClick={() => handleStatus(row.id, 'rejected')}>Reject</Button>
      </div>
    ) : null },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Prescriptions</h1>
        <div className="flex gap-2">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white">
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <Button onClick={() => setShowUpload(true)}>+ Upload</Button>
        </div>
      </div>
      <Table columns={columns} data={prescriptions} loading={loading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal isOpen={showUpload} onClose={() => setShowUpload(false)} title="Upload Prescription">
        <div className="space-y-4">
          <Select label="Customer" value={customerId} onChange={(e) => setCustomerId(e.target.value)} options={customers.map((c) => ({ value: c.id, label: c.name }))} />
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full text-sm" accept="image/*,.pdf" />
          <Button onClick={handleUpload} className="w-full">Upload</Button>
        </div>
      </Modal>
    </div>
  );
}
